/**
 * Alarm Types
 * TypeScript interfaces for alarm management
 */

// Program Module Types (0-39)
export enum ProgramModuleType {
  LABEL = 0,
  OVER = 1,
  UNDER = 2,
  AVG = 3,
  MIN = 7,
  MAX = 8,
  SUBTRACT = 12,
  CMP = 15,
  CHG = 16,
  IFNUL = 17,
  SEV = 18,
  TD = 19,
  COUNT = 26,
}

export interface ProgramModule {
  type: number;
  x: number;
  y: number;
  name: string;
  inputs?: string[];
  classes?: string[];
  parameters?: string[];
}

export interface AlarmPatternDTO {
  id: string;
  disciplineTypeId: string;
  alarmPatternKey: string;
  version: number;
  isLatest: boolean;
  no: number;
  alarmId: string;
  textExpr: string;
  genericFamily: string;
  genericId: string;
  trapPdu1: string;
  trapFlag: number;
  suppressionPeriod: number;
  programModules: ProgramModule[];
  createdAt: string;
  createdBy: string | null;
  changeDescription: string | null;
}

export interface DisciplineDTO {
  id: string;
  name: string;
  enterpriseName: string;
  enterpriseVersion: number;
  createdAt: string;
  updatedAt: string;
  types?: DisciplineTypeDTO[];
}

export interface DisciplineTypeDTO {
  id: string;
  disciplineId: string;
  name: string;
  createdAt: string;
  discipline?: {
    id: string;
    name: string;
  };
}

export interface ClassDTO {
  id: string;
  disciplineTypeId: string;
  classId: string;
  description: string;
  defaultFlag: number;
  data: SeverityThreshold | null;
  patterns: ClassPattern[] | null;
  createdAt: string;
}

export interface SeverityThreshold {
  ok?: [number | null, string | null];
  recovering?: [number | null, string | null];
  warning?: [number | null, string | null];
  minor?: [number | null, string | null];
  major?: [number | null, string | null];
  critical?: [number | null, string | null];
  terminal?: [number | null, string | null];
}

export interface ClassPattern {
  pattern: string;
  flags: number;
}

export interface AlarmFlowsResponse {
  discipline: {
    id: string;
    name: string;
  };
  disciplineType: {
    id: string;
    name: string;
  };
  alarms: AlarmPatternDTO[];
  classes: ClassDTO[];
}

export interface NewAlarmFlowsResponse {
  discipline: {
    id: string;
    name: string;
  };
  disciplineTypes: Array<{
    disciplineType: {
      id: string;
      name: string;
    };
    alarms: AlarmPatternDTO[];
    classes: ClassDTO[];
  }>;
}



export interface DisciplinesResponse {
  disciplines: DisciplineDTO[];
}

export interface AlarmPatternResponse {
  alarmPattern: AlarmPatternDTO;
}

export interface UpdateAlarmPatternRequest {
  textExpr?: string;
  genericFamily?: string;
  genericId?: string;
  trapPdu1?: string;
  trapFlag?: number;
  suppressionPeriod?: number;
  programModules?: ProgramModule[];
  changeDescription?: string;
}

export interface CreateAlarmPatternRequest {
  disciplineTypeId: string;
  no: number;
  alarmId: string;
  textExpr: string;
  genericFamily: string;
  genericId: string;
  trapPdu1: string;
  trapFlag: number;
  suppressionPeriod: number;
  programModules?: ProgramModule[];
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Import types
export interface ImportErrorDetail {
  type: 'discipline' | 'disciplineType' | 'alarmPattern' | 'class' | 'field';
  name: string;
  message: string;
}

export interface ImportSummaryDTO {
  disciplinesCreated: number;
  disciplineTypesCreated: number;
  alarmPatternsCreated: number;
  classesCreated: number;
  fieldsCreated: number;
  errors: ImportErrorDetail[];
}

export interface ImportConfigRequest {
  configs: string[];
  overwriteExisting?: boolean;
}
