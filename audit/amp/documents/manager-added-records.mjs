import records from "./manager-added-records.json" with { type: "json" };

export const managerAddedDocumentRecords =
  Object.freeze(
    records.map((record) =>
      Object.freeze(record),
    ),
  );
