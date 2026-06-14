"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliberationAgentRole = exports.TaskRoutingPath = exports.TaskStatus = exports.TaskInputUrgencyLevel = void 0;
exports.TaskInputUrgencyLevel = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
};
exports.TaskStatus = {
    pending: 'pending',
    fast_path: 'fast_path',
    debating: 'debating',
    completed: 'completed',
    failed: 'failed',
    overridden: 'overridden',
};
exports.TaskRoutingPath = {
    fast_path: 'fast_path',
    cognitive_debate: 'cognitive_debate',
};
exports.DeliberationAgentRole = {
    planner: 'planner',
    risk: 'risk',
    resource: 'resource',
    ethics: 'ethics',
};
//# sourceMappingURL=api.schemas.js.map