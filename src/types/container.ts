export interface IContainer {
  id: string;
  image: string;
  createdAt: string;
  status: string;
  port: string;
  names: string;
  statsInfo?: IContainerStats;
}

export type TContainerList = Array<IContainer>;

export interface IContainerMemory {
  usage: string;
  usagePercent: string;
}

export interface IContainerStats {
  cpuPercent: string;
  memoryInfo: IContainerMemory;
  netIO: string;
  blockIO: string;
}
