import {TContainerList} from './../types/container';

export function convertStringToContainerList(input: String): TContainerList {
  const convertedInput = input.replace(/\r?\n|\r/g, ',');
  const containerListInString = `[${convertedInput}]`;
  const containerList = JSON.parse(containerListInString) as TContainerList;

  return containerList;
}
