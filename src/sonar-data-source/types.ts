import { AxiosBasicCredentials } from 'axios';

export interface ProjectsResponse {
  paging: Paging;
  components: Component[];
  facets: Facet[];
}

export interface Component {
  key: string;
  name: string;
  qualifier: Qualifier;
  isFavorite: boolean;
  tags: any[];
  visibility: Visibility;
  needIssueSync: boolean;
}

export enum Visibility {
  Public = 'public',
}

export enum FacetValues {
  AUTHORS = 'authors',
}

export interface Facet {
  property: FacetValues;
  values: Value[];
}

export interface Value {
  val: string;
  count: number;
}

export interface Paging {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface IssuesResponse {
  total: number;
  p: number;
  ps: number;
  paging: Paging;
  effortTotal: number;
  issues: Issue[];
  components: Component[];
  facets: Facet[];
}

export interface Component {
  key: string;
  enabled?: boolean;
  qualifier: Qualifier;
  name: string;
  longName?: string;
  path?: string;
  description?: string;
}

export interface ComponentWithMetric extends Component {
  measures: Measure[];
}

export interface Measure {
  metric: string;
  value: number;
  bestValue?: boolean;
}
export interface MetricResponse {
  component: ComponentWithMetric;
}

export enum Qualifier {
  Fil = 'FIL',
  Trk = 'TRK',
  Uts = 'UTS',
}

export interface Value {
  val: string;
  count: number;
}

export interface Issue {
  key: string;
  rule: string;
  severity: Severity;
  component: string;
  project: Project;
  line?: number;
  hash?: string;
  textRange?: TextRange;
  flows: Flow[];
  status: Status;
  message: string;
  effort?: Debt;
  debt?: Debt;
  author: string;
  tags: Tag[];
  creationDate: Date;
  updateDate: Date;
  type: Type;
  scope: Scope;
}

export enum Debt {
  The10Min = '10min',
  The1H = '1h',
  The1H40Min = '1h40min',
  The1Min = '1min',
  The20Min = '20min',
  The22Min = '22min',
  The2Min = '2min',
  The30Min = '30min',
  The40Min = '40min',
  The5Min = '5min',
}

export interface Flow {
  locations: Location[];
}

export interface Location {
  component: string;
  textRange: TextRange;
  msg: Msg;
}

export enum Msg {
  Original = 'Original',
  The1 = '+1',
  The2Incl1ForNesting = '+2 (incl 1 for nesting)',
  The3Incl2ForNesting = '+3 (incl 2 for nesting)',
  The4Incl3ForNesting = '+4 (incl 3 for nesting)',
}

export interface TextRange {
  startLine: number;
  endLine: number;
  startOffset: number;
  endOffset: number;
}

export enum Project {
  OrgSpringframeworkBootMcomercial = 'org.springframework.boot:mcomercial',
  OrgSpringframeworkBootMtecnico = 'org.springframework.boot:mtecnico',
  OrgSpringframeworkBootScore = 'org.springframework.boot:score',
  PECOMPacificoDIPNapayNapay = 'pe.com.pacifico.dip.napay:napay',
}

export enum Scope {
  Main = 'MAIN',
  Test = 'TEST',
}

export enum Severity {
  Blocker = 'BLOCKER',
  Critical = 'CRITICAL',
  Info = 'INFO',
  Major = 'MAJOR',
  Minor = 'MINOR',
}

export enum Status {
  Open = 'OPEN',
}

export enum Tag {
  BadPractice = 'bad-practice',
  BasedOnMisra = 'based-on-misra',
  BrainOverload = 'brain-overload',
  CERT = 'cert',
  Clumsy = 'clumsy',
  Convention = 'convention',
  Cwe = 'cwe',
  Design = 'design',
  ErrorHandling = 'error-handling',
  Java8 = 'java8',
  Leak = 'leak',
  OwaspA3 = 'owasp-a3',
  Performance = 'performance',
  Pitfall = 'pitfall',
  Serialization = 'serialization',
  Spring = 'spring',
  Suspicious = 'suspicious',
  Tests = 'tests',
  Unused = 'unused',
}

export enum Type {
  Bug = 'BUG',
  CodeSmell = 'CODE_SMELL',
  Vulnerability = 'VULNERABILITY',
}

export interface Paging {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  p?: number;
  ps?: number;
  s?: string;
  asc?: boolean;
  facets?: string;
  componentKeys?: string;
  createdInLast?: string;
  createdAfter?: string;
}

export enum truthyPaginationParam {
  YES = 'yes',
  TRUE = 'true',
}

export interface RequestPaginationsArgs {
  paginationParams?: PaginationParams;
  auth?: AxiosBasicCredentials;
}
