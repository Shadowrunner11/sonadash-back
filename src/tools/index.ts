import langMap from 'lang-map';
import { Model } from 'mongoose';
import { IFilters, PaginationParams } from 'src/types';
import {
  FilterItemString,
  FilterItemsString,
} from './graphql/entitites/pagination.graphql';
import { TimeFilter } from 'src/author/models/author.grapqhl';

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

export const buildItemFilter = ({ value, isExclusion }: FilterItemString) =>
  isExclusion ? { $ne: value } : value;

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
  filterData: FilterItemsString | FilterItemString,
) => {
  if (filterData instanceof FilterItemString)
    return buildItemFilter(filterData);

  return buildListItemsFilter(filterData);
};

// TODO: add default black list of items to singularize
export const singularize = (word: string) => {
  const lastLetter = word.charAt(word.length - 1);

  if (lastLetter === 's') return word.substring(0, word.length - 1);

  return word;
};

export const buildTimeFitler = ({ afterDate, beforeDate }: TimeFilter) => ({
  ...(afterDate ? { $gte: afterDate } : {}),
  ...(beforeDate ? { $lte: beforeDate } : {}),
});

export const buildFilter = (filter: IFilters) =>
  Object.keys(filter).reduce(
    (finalFilter: Record<string, unknown>, nextFilter) => {
      const filterData = filter[nextFilter];

      const fieldName = singularize(nextFilter);

      if (filterData instanceof TimeFilter) {
        finalFilter[fieldName] = buildTimeFitler(filterData);
        return finalFilter;
      }

      finalFilter[fieldName] = buildItemsFilter(filterData);

      return finalFilter;
    },
    {},
  );

// TODO: aggrergar middleware de validacion antes q consuma request a la base de datos

export const getPaginatedResults = async <T = unknown>(
  model: Model<T>,
  { page, limit = 10 }: PaginationParams,
  filter?: IFilters,
) => {
  const skip = (page - 1) * limit;
  const total = await model.count();

  const parsedFilter = filter ? buildFilter(filter) : {};

  const data = await model.find(parsedFilter).skip(skip).limit(limit).lean();

  return {
    data,
    pagination: {
      total,
      page,
    },
  };
};
