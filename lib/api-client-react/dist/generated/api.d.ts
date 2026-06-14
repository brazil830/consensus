import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem, AuditExport, Capsule, DashboardStats, Deliberation, HealthStatus, OverrideInput, Task, TaskInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTasksUrl: () => string;
/**
 * @summary List all tasks
 */
export declare const listTasks: (options?: RequestInit) => Promise<Task[]>;
export declare const getListTasksQueryKey: () => readonly ["/api/tasks"];
export declare const getListTasksQueryOptions: <TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listTasks>>>;
export type ListTasksQueryError = ErrorType<unknown>;
/**
 * @summary List all tasks
 */
export declare function useListTasks<TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTaskUrl: () => string;
/**
 * @summary Create and execute a new task
 */
export declare const createTask: (taskInput: TaskInput, options?: RequestInit) => Promise<Task>;
export declare const getCreateTaskMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export type CreateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createTask>>>;
export type CreateTaskMutationBody = BodyType<TaskInput>;
export type CreateTaskMutationError = ErrorType<void>;
/**
* @summary Create and execute a new task
*/
export declare const useCreateTask: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export declare const getGetTaskUrl: (id: number) => string;
/**
 * @summary Get a task by ID
 */
export declare const getTask: (id: number, options?: RequestInit) => Promise<Task>;
export declare const getGetTaskQueryKey: (id: number) => readonly [`/api/tasks/${number}`];
export declare const getGetTaskQueryOptions: <TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getTask>>>;
export type GetTaskQueryError = ErrorType<void>;
/**
 * @summary Get a task by ID
 */
export declare function useGetTask<TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getOverrideTaskUrl: (id: number) => string;
/**
 * @summary Human-in-the-loop override for a task
 */
export declare const overrideTask: (id: number, overrideInput: OverrideInput, options?: RequestInit) => Promise<Task>;
export declare const getOverrideTaskMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof overrideTask>>, TError, {
        id: number;
        data: BodyType<OverrideInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof overrideTask>>, TError, {
    id: number;
    data: BodyType<OverrideInput>;
}, TContext>;
export type OverrideTaskMutationResult = NonNullable<Awaited<ReturnType<typeof overrideTask>>>;
export type OverrideTaskMutationBody = BodyType<OverrideInput>;
export type OverrideTaskMutationError = ErrorType<void>;
/**
* @summary Human-in-the-loop override for a task
*/
export declare const useOverrideTask: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof overrideTask>>, TError, {
        id: number;
        data: BodyType<OverrideInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof overrideTask>>, TError, {
    id: number;
    data: BodyType<OverrideInput>;
}, TContext>;
export declare const getGetTaskDeliberationsUrl: (id: number) => string;
/**
 * @summary Get all agent deliberations for a task
 */
export declare const getTaskDeliberations: (id: number, options?: RequestInit) => Promise<Deliberation[]>;
export declare const getGetTaskDeliberationsQueryKey: (id: number) => readonly [`/api/tasks/${number}/deliberations`];
export declare const getGetTaskDeliberationsQueryOptions: <TData = Awaited<ReturnType<typeof getTaskDeliberations>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskDeliberations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTaskDeliberations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskDeliberationsQueryResult = NonNullable<Awaited<ReturnType<typeof getTaskDeliberations>>>;
export type GetTaskDeliberationsQueryError = ErrorType<unknown>;
/**
 * @summary Get all agent deliberations for a task
 */
export declare function useGetTaskDeliberations<TData = Awaited<ReturnType<typeof getTaskDeliberations>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskDeliberations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTaskCapsuleUrl: (id: number) => string;
/**
 * @summary Get the cryptographic memory capsule for a task
 */
export declare const getTaskCapsule: (id: number, options?: RequestInit) => Promise<Capsule>;
export declare const getGetTaskCapsuleQueryKey: (id: number) => readonly [`/api/tasks/${number}/capsule`];
export declare const getGetTaskCapsuleQueryOptions: <TData = Awaited<ReturnType<typeof getTaskCapsule>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskCapsule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTaskCapsule>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskCapsuleQueryResult = NonNullable<Awaited<ReturnType<typeof getTaskCapsule>>>;
export type GetTaskCapsuleQueryError = ErrorType<void>;
/**
 * @summary Get the cryptographic memory capsule for a task
 */
export declare function useGetTaskCapsule<TData = Awaited<ReturnType<typeof getTaskCapsule>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTaskCapsule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getExportAuditLogUrl: (id: number) => string;
/**
 * @summary Export full audit log for a task as JSON-LD
 */
export declare const exportAuditLog: (id: number, options?: RequestInit) => Promise<AuditExport>;
export declare const getExportAuditLogQueryKey: (id: number) => readonly [`/api/tasks/${number}/audit-export`];
export declare const getExportAuditLogQueryOptions: <TData = Awaited<ReturnType<typeof exportAuditLog>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportAuditLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof exportAuditLog>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ExportAuditLogQueryResult = NonNullable<Awaited<ReturnType<typeof exportAuditLog>>>;
export type ExportAuditLogQueryError = ErrorType<void>;
/**
 * @summary Export full audit log for a task as JSON-LD
 */
export declare function useExportAuditLog<TData = Awaited<ReturnType<typeof exportAuditLog>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportAuditLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCapsulesUrl: () => string;
/**
 * @summary List all memory capsules (chained audit trail)
 */
export declare const listCapsules: (options?: RequestInit) => Promise<Capsule[]>;
export declare const getListCapsulesQueryKey: () => readonly ["/api/capsules"];
export declare const getListCapsulesQueryOptions: <TData = Awaited<ReturnType<typeof listCapsules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCapsules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCapsules>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCapsulesQueryResult = NonNullable<Awaited<ReturnType<typeof listCapsules>>>;
export type ListCapsulesQueryError = ErrorType<unknown>;
/**
 * @summary List all memory capsules (chained audit trail)
 */
export declare function useListCapsules<TData = Awaited<ReturnType<typeof listCapsules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCapsules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get platform dashboard summary statistics
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get platform dashboard summary statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRecentActivityUrl: () => string;
/**
 * @summary Get recent task activity feed
 */
export declare const getRecentActivity: (options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: () => readonly ["/api/dashboard/recent-activity"];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent task activity feed
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map