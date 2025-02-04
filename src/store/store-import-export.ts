import { TodoStoreExport } from "../phaedra.types";

export interface IStoreImportExport {
  importStore(data: TodoStoreExport): void;
  exportStore(): TodoStoreExport;
}
