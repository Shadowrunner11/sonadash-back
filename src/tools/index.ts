import langMap from 'lang-map';
import { Model } from 'mongoose';
import { IFilters, PaginationParams } from 'src/types';
import {
  FilterItemString,
  FilterItemsString,
} from './graphql/entitites/pagination.graphql';
import { TimeFilter } from 'src/author/models/author.grapqhl';
import { Logger } from '@nestjs/common';

export const getFileExtension = (filePath: string) =>
  filePath?.split('.')?.pop() || filePath;

export function getFirstLanguageFromFile(filePath: string) {
  try {
    const [firstLanguage] = langMap.languages(getFileExtension(filePath)) ?? [];

    return firstLanguage;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return 'File type not identified';
  }
}

export const formatISOWithTUTCDate = (date: Date) =>
  date.toISOString().replace(/\..+Z/i, '+0000');

export const getCredentialsFromBasicAuth = (base64AuthValue: string) =>
  Buffer.from(base64AuthValue.replace('Basic ', ''), 'base64')
    .toString()
    .split(':')
    .reduce(
      (prevPojo, value, index) => {
        const key = index === 0 ? 'username' : 'password';
        prevPojo[key] = value ?? '';
        return prevPojo;
      },
      { username: '', password: '' },
    );

export const buildItemFilter = ({
  value,
  isExclusion,
  isPartialMatch,
}: FilterItemString) => {
  const searchValue = isPartialMatch ? new RegExp(value, 'ig') : value;

  return isExclusion ? { $ne: value } : searchValue;
};

export const buildListItemsFilter = ({
  values,
  isExclusion,
}: FilterItemsString) => {
  if (values.length === 1) {
    const [singleFilter] = values;
    return buildItemFilter({ value: singleFilter, isExclusion });
  }

  return { [isExclusion ? '$nin' : '$in']: values };
};

export const buildItemsFilter = (
  filterData: FilterItemString | FilterItemsString,
) => {
  if (filterData instanceof FilterItemString || !filterData.values)
    return buildItemFilter(filterData as FilterItemString);

  return buildListItemsFilter(filterData);
};

const defaultblackListSingularize = Object.freeze(['status']);

// TODO: add default black list of items to singularize
export const singularize = (
  word: string,
  blackList = defaultblackListSingularize,
) => {
  if (blackList.includes(word)) return word;

  const lastLetter = word.charAt(word.length - 1);

  if (lastLetter === 's') return word.substring(0, word.length - 1);

  return word;
};

export const buildTimeFitler = ({ afterDate, beforeDate }: TimeFilter) => ({
  ...(afterDate ? { $gte: new Date(afterDate) } : {}),
  ...(beforeDate ? { $lte: new Date(beforeDate) } : {}),
});

//TODO: it is not correct to cast as any, th problem is that filter passed from request has not prototype for securtyri reasons
// create an entity factory to solve this problem
export const buildFilter = (filter: IFilters) =>
  Object.keys(filter).reduce(
    (finalFilter: Record<string, unknown>, nextFilter) => {
      const filterData: any = filter[nextFilter];

      const fieldName = singularize(nextFilter);

      if (filterData.afterDate || filterData.beforeDate) {
        finalFilter[fieldName] = buildTimeFitler(filterData as TimeFilter);
        return finalFilter;
      }

      finalFilter[fieldName] = buildItemsFilter(filterData);

      return finalFilter;
    },
    {},
  );

// TODO: aggrergar middleware de validacion antes q consuma request a la base de datos
const loggerPaginatedResults = new Logger();

export const getPaginatedResults = async <T = unknown>(
  model: Model<T>,
  { page, limit = 10 }: PaginationParams,
  filter?: IFilters,
) => {
  const skip = (page - 1) * limit;
  loggerPaginatedResults.debug(filter);
  const parsedFilter = filter ? buildFilter(filter) : {};
  loggerPaginatedResults.debug(parsedFilter);
  const total = await model.count(parsedFilter).exec();

  const data = await model
    .find(parsedFilter)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  return {
    data,
    pagination: {
      total,
      page,
    },
  };
};

/**
* Process a large array of data in batches and applies a callback function to each item in the batch.
* @param data - Array of data to be processed in batches.
* @param cb - Callback function to be applied to each item in the batch.
* @param limit - Batch size limit, default to 1000.
* @returns Array of results from applying the callback function to each item in the batch.
* @typeparam T - Type of the input data array.
* @typeparam K - Type of the output data array.
* @example
* const getPokemonList = async () => {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const { results: pokemonList } = response.data;

    const results = await batchProcessWithCallback<Pokemon, Pokemon>(
      pokemonList,
      doSomethingWithEachPokemon, // do somenthing with each pokemon one by one
      50 // Process 50 Pokemon at a time
    );

    return results;
};

 getPokemonList().then(console.log).catch(console.error);
*/
export const batchProccess = async <T = unknown, K = unknown>(
  data: T[],
  cb: (
    item: T,
    index: number,
    batchIteration: number,
    array: T[],
  ) => Promise<K>,
  limit = 1000,
) => {
  const temp = [...data];
  const results: K[] = [];
  let batchIteration = 0;

  while (temp.length) {
    const batch = temp.splice(0, limit);
    const partitalResults = await Promise.all(
      batch.map((e, i, a) => cb(e, i, batchIteration, a)),
    );

    results.push(...partitalResults);
    batchIteration++;
  }

  return results;
};

export const debouncedPromise = <T = any>(cb: () => Promise<T>) => {
  return new Promise((res) => {
    setTimeout(async () => {
      const response = await cb();
      console.log('ending debounce');
      res(response);
    }, 3000);
  });
};
