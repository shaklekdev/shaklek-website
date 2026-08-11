export type TrendStatus = "pending" | "approved" | "rejected";

export type TrendCandidate = {
  id: string;
  title: string;
  garmentType: string;
  signal: string;
  sourceCount: number;
  weeksRunning: number;
  detectedAt: string; // ISO date
  gradient: string; // placeholder swatch, same pattern as CatalogCard until real imagery exists
  status: TrendStatus;
};

export const trendCandidates: TrendCandidate[] = [
  {
    id: "tc-001",
    title: "Puff-sleeve linen tunic",
    garmentType: "Dress",
    signal: "Recurring balloon-sleeve silhouette across mid-market UAE and GCC retailers",
    sourceCount: 14,
    weeksRunning: 3,
    detectedAt: "2026-07-21",
    gradient: "linear-gradient(135deg, #e8dcc8 0%, #c9a86a 100%)",
    status: "pending",
  },
  {
    id: "tc-002",
    title: "Wide-leg cropped trouser",
    garmentType: "Pants",
    signal: "Cropped, wide-leg silhouette trending across regional fashion editorials",
    sourceCount: 9,
    weeksRunning: 2,
    detectedAt: "2026-07-28",
    gradient: "linear-gradient(135deg, #d9d4c8 0%, #8a8272 100%)",
    status: "pending",
  },
  {
    id: "tc-003",
    title: "Asymmetric wrap skirt",
    garmentType: "Skirt",
    signal: "Asymmetric hem + wrap closure appearing across 3 separate regional marketplaces",
    sourceCount: 11,
    weeksRunning: 4,
    detectedAt: "2026-07-14",
    gradient: "linear-gradient(135deg, #ead9d9 0%, #b98686 100%)",
    status: "approved",
  },
  {
    id: "tc-004",
    title: "Oversized structured collar shirt",
    garmentType: "Shirt",
    signal: "Exaggerated collar detail, consistent across 5 sources this month",
    sourceCount: 7,
    weeksRunning: 1,
    detectedAt: "2026-08-04",
    gradient: "linear-gradient(135deg, #dbe4e2 0%, #7fa89e 100%)",
    status: "pending",
  },
  {
    id: "tc-005",
    title: "Logo-plaque cargo pants",
    garmentType: "Pants",
    signal: "Trending, but every source example carries a visible third-party logo plaque — too close to the brand original to safely regenerate",
    sourceCount: 6,
    weeksRunning: 2,
    detectedAt: "2026-07-30",
    gradient: "linear-gradient(135deg, #e3ded6 0%, #a39a86 100%)",
    status: "rejected",
  },
  {
    id: "tc-006",
    title: "Fitted midi shirt-dress",
    garmentType: "Dress",
    signal: "Steady low-key trend, shirt-dress silhouette with fitted waist seam",
    sourceCount: 10,
    weeksRunning: 5,
    detectedAt: "2026-07-07",
    gradient: "linear-gradient(135deg, #e6dfd0 0%, #b7a06a 100%)",
    status: "pending",
  },
  {
    id: "tc-007",
    title: "Elevated linen co-ord set",
    garmentType: "Dress",
    signal: "Matching-set silhouette, high repeat rate across premium-tier sources",
    sourceCount: 13,
    weeksRunning: 3,
    detectedAt: "2026-07-21",
    gradient: "linear-gradient(135deg, #ded9e6 0%, #8f7fa8 100%)",
    status: "pending",
  },
];
