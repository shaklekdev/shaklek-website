// Create the Route 53 health check for www.shaklek.com, plus its alarm.
//
//   node scripts/aws-health-check.mjs            # dry run, prints the plan
//   node scripts/aws-health-check.mjs --apply
//
// WHY THIS EXISTS. Every existing alarm reads Amplify's OWN metrics
// (AWS/AmplifyHosting: Requests, Latency, 5xxErrors), so they only see traffic
// that ARRIVED. If DNS fails, or a TLS handshake hangs, or an edge drops the
// connection, nothing reaches Amplify and all three alarms stay green while the
// site is unreachable. That gap is exactly what a whole afternoon of 2026-09-13
// was spent arguing inside, with no record to settle it.
//
// This checks from outside, from Route 53's global checkers, and writes a
// metric whether or not anybody is watching. It is the same argument CLAUDE.md
// makes for scripts/db-migrate.mjs: a check that runs on its own beats a rule
// that depends on somebody being curious.
//
// ⚠️ TWO THINGS FROM AWS'S OWN DOCS THAT WOULD BREAK THIS SILENTLY.
//
// 1. A health check specified BY DOMAIN NAME uses IPv4 ONLY. Straight from the
//    docs: "If you specify the endpoint by domain name, Route 53 uses only IPv4
//    to send health checks to the endpoint." www.shaklek.com has eight AAAA
//    records, and the leading hypothesis for the intermittent hangs is the IPv6
//    path. SO THIS MONITOR CANNOT SEE THAT FAULT. It is still worth having for
//    everything else; it is not the whole answer, and nobody should read a
//    green check as proof the site was reachable for a v6 client.
//
// 2. Route 53 health-check metrics are published ONLY to us-east-1. Every other
//    alarm on this account is in eu-west-1. An alarm created in the wrong
//    region never fires and looks perfectly healthy while doing nothing. That
//    is the same shape as the build-spec allowlist trap.
//
// ⚠️ SNI MUST BE ON. CloudFront serves many domains per IP and needs the host
// name in the TLS client_hello. Without EnableSNI the check fails permanently
// and looks like a real outage.
//
// COST, so nobody is surprised: an AWS endpoint is $0.50/month, HTTPS adds
// $1.00. String matching and latency graphs add $1.00 each and are NOT enabled
// here: the failure being chased is a hang, which a plain check already catches,
// and this brand has committed about 8,900 AED in total. Turn string matching
// on the day a broken-but-200 page becomes the worry.
import { execFileSync } from "node:child_process";

const ACCOUNT = "793168138974";
const DOMAIN = "www.shaklek.com";
const NAME = "shaklek-www-reachable";
const ALARM = "shaklek-www-unreachable";
// ⚠️ NOT eu-west-1. See note 2 above.
const METRIC_REGION = "us-east-1";
const APPLY = process.argv.includes("--apply");

const aws = (args) =>
  execFileSync("aws", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });

const config = {
  Type: "HTTPS",
  FullyQualifiedDomainName: DOMAIN,
  Port: 443,
  // ⚠️ /robots.txt, NOT /. Route 53's checkers send roughly one request every
  // two seconds across all locations, about 1.3 MILLION a month. The pre-launch
  // page is 23KB; robots.txt is 154 bytes. At $0.15/GB after a 15GB free tier
  // that is the difference between a rounding error and eating the free tier
  // that currently covers all real traffic. It proves the same things: DNS,
  // TLS, the edge, and a 200.
  ResourcePath: "/robots.txt",
  // 30 seconds, not 10. Ten costs extra and this is a reachability check, not
  // a trading system.
  RequestInterval: 30,
  // Three consecutive failures before it flips. One is noise: checkers do not
  // coordinate, and a single dropped packet somewhere should not page anyone.
  FailureThreshold: 3,
  EnableSNI: true,
  MeasureLatency: false,
};

// Name the account out loud and refuse if it is not this one, the same way
// db-migrate.mjs names the database. A billed resource in the wrong account is
// quiet and recurring.
const who = JSON.parse(aws(["sts", "get-caller-identity", "--output", "json"]));
if (who.Account !== ACCOUNT) {
  console.error(`refusing: signed in to account ${who.Account}, expected ${ACCOUNT}`);
  process.exit(1);
}
console.log(`account ${who.Account}`);

// ⚠️ AN ALARM WITH NO ACTION NOTIFIES NOBODY, and a CloudWatch alarm can only
// target an SNS topic IN ITS OWN REGION. The only topic on this account,
// shaklek-alerts, is in eu-west-1; Route 53 metrics exist only in us-east-1.
// Without this the alarm flips to ALARM and sends nothing, which is the
// "looks healthy while doing nothing" shape this script warns about.
function ensureTopic() {
  const list = JSON.parse(aws(["sns", "list-topics", "--region", METRIC_REGION, "--output", "json"]));
  const found = (list.Topics || []).find((t) => t.TopicArn.endsWith(":shaklek-alerts"));
  if (found) return found.TopicArn;
  if (!APPLY) return `(would create shaklek-alerts in ${METRIC_REGION})`;
  const made = JSON.parse(
    aws(["sns", "create-topic", "--region", METRIC_REGION, "--name", "shaklek-alerts", "--output", "json"]),
  );
  console.log(`created SNS topic ${made.TopicArn}`);
  console.log("SUBSCRIBE AN EMAIL TO IT OR IT STILL NOTIFIES NOBODY:");
  console.log(`  aws sns subscribe --region ${METRIC_REGION} --topic-arn ${made.TopicArn} --protocol email --notification-endpoint hello@shaklek.com`);
  return made.TopicArn;
}
const topicArn = ensureTopic();
console.log(`alarm notifies ${topicArn}`);

console.log(`health check "${NAME}"`);
for (const [k, v] of Object.entries(config)) console.log(`  ${k.padEnd(26)} ${v}`);
console.log(`\nalarm "${ALARM}" in ${METRIC_REGION}  (NOT eu-west-1 -- Route 53 publishes there only)`);
console.log(`  fires when HealthCheckStatus < 1 for 2 consecutive minutes`);
console.log(`\n⚠️ IPv4 ONLY. A domain-name health check cannot test the AAAA records,`);
console.log(`   so a green check is not proof an IPv6 client could reach the site.`);
console.log(`\ncost: about $1.50/month (AWS endpoint $0.50 + HTTPS $1.00).`);

// Never create a second one for the same domain. A duplicate health check bills
// twice and makes two alarms that disagree.
let existingId = null;
try {
  const list = JSON.parse(aws(["route53", "list-health-checks", "--output", "json"]));
  const hit = (list.HealthChecks || []).find(
    (h) => h.HealthCheckConfig?.FullyQualifiedDomainName === DOMAIN,
  );
  if (hit) existingId = hit.Id;
} catch (err) {
  console.error("\ncould not list health checks:", String(err.stderr || err.message).slice(0, 200));
  process.exit(1);
}

// ⚠️ AN EXISTING CHECK IS NOT A REASON TO STOP. If an earlier run created the
// health check then failed before the alarm, exiting here leaves a BILLED
// ORPHAN that no re-run repairs. put-metric-alarm is an upsert, so falling
// through is safe and fixes exactly that.
if (existingId) {
  console.log(`\n✅ health check for ${DOMAIN} already exists: ${existingId}`);
  console.log("   skipping creation, still ensuring the alarm.");
}

if (!APPLY) {
  console.log("\ndry run. Re-run with --apply to create it.");
  process.exit(0);
}

// CallerReference must be unique per creation; a timestamp is the documented
// way to do that and makes a retry after a partial failure safe.
let id = existingId;
if (!id) {
  const created = JSON.parse(
    aws([
      "route53", "create-health-check",
      "--caller-reference", `shaklek-www-${Date.now()}`,
      "--health-check-config", JSON.stringify(config),
      "--output", "json",
    ]),
  );
  id = created.HealthCheck.Id;
  console.log(`\ncreated health check ${id}`);
  aws([
    "route53", "change-tags-for-resource",
    "--resource-type", "healthcheck",
    "--resource-id", id,
    "--add-tags", `Key=Name,Value=${NAME}`,
  ]);
}

aws([
  "cloudwatch", "put-metric-alarm",
  "--region", METRIC_REGION,
  "--alarm-name", ALARM,
  "--alarm-description",
  "www.shaklek.com unreachable from Route 53's global checkers. Unlike the Amplify alarms this sees DNS and TLS failures that never reach the origin. IPv4 only.",
  "--namespace", "AWS/Route53",
  "--metric-name", "HealthCheckStatus",
  "--dimensions", `Name=HealthCheckId,Value=${id}`,
  "--statistic", "Minimum",
  "--period", "60",
  "--evaluation-periods", "2",
  "--threshold", "1",
  "--comparison-operator", "LessThanThreshold",
  // ⚠️ breaching, NOT notBreaching. Route 53 publishes HealthCheckStatus every
  // minute regardless of endpoint state (0 when unhealthy), so "missing" does
  // not mean "site fine, metric late" -- it means the check was disabled,
  // deleted, or stopped being billed. notBreaching reads that as OK forever,
  // which is the exact failure mode this script exists to close.
  "--treat-missing-data", "breaching",
  "--alarm-actions", topicArn,
  "--ok-actions", topicArn,
]);
console.log(`created alarm ${ALARM} in ${METRIC_REGION}`);

// Read both back. The exit code is not the check.
const back = JSON.parse(aws(["route53", "get-health-check", "--health-check-id", id, "--output", "json"]));
const sni = back.HealthCheck.HealthCheckConfig.EnableSNI;
const alarms = JSON.parse(
  aws(["cloudwatch", "describe-alarms", "--region", METRIC_REGION, "--alarm-names", ALARM, "--output", "json"]),
);
console.log(`\nverified: SNI=${sni}, alarm exists=${(alarms.MetricAlarms || []).length === 1}`);
if (!sni || (alarms.MetricAlarms || []).length !== 1) {
  console.error("❌ one of those is wrong. Check the console before trusting this.");
  process.exit(1);
}
console.log("\n⚠️ ONE EXISTING ALARM IS NOW BLIND, AND FIXING IT IS A DECISION.");
console.log("   Route 53 sends ~1,800 requests an hour. shaklek-site-silent fires on");
console.log("   'fewer than 1 Amplify request in an hour', so it can never fire again.");
console.log("   Retire it or raise its threshold above the synthetic floor. It is NOT");
console.log("   changed here: silently editing an existing alarm is how monitoring is lost.");
console.log("\n⚠️ AND THIS MOSTLY EXERCISES THE CDN CACHE, not the Next server. An origin");
console.log("   outage where CloudFront keeps serving cached pages stays green; the 5xx");
console.log("   and latency alarms are what cover the origin.");

console.log("\n✅ done. It takes a few minutes to report its first status.");
console.log(`   aws route53 get-health-check-status --health-check-id ${id}`);
