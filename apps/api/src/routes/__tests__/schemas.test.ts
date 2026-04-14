import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the validation schemas from workspaces route
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional(),
  tier: z.enum(['solo', 'team', 'organization', 'enterprise']).optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  key: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, 'Key must be uppercase alphanumeric starting with a letter'),
  description: z.string().max(5000).optional(),
});

const createWorkItemSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['task', 'story', 'bug', 'epic', 'initiative', 'subtask']),
  title: z.string().min(1).max(500),
  workflowStatusId: z.string().uuid(),
});

describe('workspace validation schemas', () => {
  it('accepts valid workspace input', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My Workspace',
      slug: 'my-workspace',
      tier: 'team',
    });
    expect(result.success).toBe(true);
  });

  it('rejects slug with uppercase letters', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'Test', slug: 'My-Workspace' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '', slug: 'valid-slug' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid tier', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'Test',
      slug: 'test',
      tier: 'premium',
    });
    expect(result.success).toBe(false);
  });
});

describe('project validation schemas', () => {
  it('accepts valid project key', () => {
    const result = createProjectSchema.safeParse({ name: 'Backend', key: 'BE' });
    expect(result.success).toBe(true);
  });

  it('rejects lowercase project key', () => {
    const result = createProjectSchema.safeParse({ name: 'Backend', key: 'be' });
    expect(result.success).toBe(false);
  });

  it('rejects key starting with number', () => {
    const result = createProjectSchema.safeParse({ name: 'Backend', key: '1BE' });
    expect(result.success).toBe(false);
  });

  it('rejects key over 10 chars', () => {
    const result = createProjectSchema.safeParse({ name: 'Backend', key: 'TOOLONGKEY1' });
    expect(result.success).toBe(false);
  });
});

describe('work item validation schemas', () => {
  it('accepts valid work item input', () => {
    const result = createWorkItemSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'task',
      title: 'Fix bug',
      workflowStatusId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid work item type', () => {
    const result = createWorkItemSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'feature',
      title: 'Fix bug',
      workflowStatusId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createWorkItemSchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'task',
      title: '',
      workflowStatusId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for projectId', () => {
    const result = createWorkItemSchema.safeParse({
      projectId: 'not-a-uuid',
      type: 'task',
      title: 'Valid title',
      workflowStatusId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });
});
