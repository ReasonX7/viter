import { BenchResult } from "@/runners/types";

export type SuiteItemStatus = "run" | "skip" | "todo";

export type BenchResultStatus = "pending" | "error" | "done";

export type IdObject = {
  id: string;
};

export type StatusObject<S> = {
  status: S;
};

export type DescriptionObject = {
  description: string;
};

export type DescriptionItem = IdObject &
  DescriptionObject &
  StatusObject<SuiteItemStatus> & {
    children: string[];
  };

export type BenchGroup = IdObject & {
  benchFunctionIds: string[];
};

export type BenchResultItem = IdObject &
  StatusObject<BenchResultStatus> & {
    data: bigint[] | null;
    error: Error | null;
  };
