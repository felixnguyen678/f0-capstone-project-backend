export interface IContainer {
  id: string;
  image: string;
  createdAt: string;
  status: string;
  port: string;
  names: string;
}

export type TContainerList = Array<IContainer>;

export interface IContainerStats {
  // TODO: CONTAINER STATS HERE
}
