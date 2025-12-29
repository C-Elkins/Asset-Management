import { ipcMain } from 'electron'
import { getDatabase } from '../database/db'
import type { CheckoutRequest, CheckoutRequestInput, ApprovalStep, ApprovalDecision, ApprovalWorkflow, ApprovalWorkflowInput } from '../types/api'

export function setupApprovalHandlers(): void {
  // Get all checkout requests with filters
  ipcMain.handle('get-checkout-requests', async (_event, filters?: { status?: string; requestedBy?: string; approverId?: string }) => {
    const db = getDatabase()

  let query = `
    SELECT
      cr.*,
      a.name as asset_name,
      a.asset_tag
    FROM checkout_requests cr
    LEFT JOIN assets a ON cr.asset_id = a.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filters?.status) {
    query += ' AND cr.status = ?'
    params.push(filters.status)
  }

  if (filters?.requestedBy) {
    query += ' AND cr.requested_by = ?'
    params.push(filters.requestedBy)
  }

  if (filters?.approverId) {
    // Find requests where this approver has a pending step
    query += ` AND cr.id IN (
      SELECT request_id FROM approval_steps
      WHERE approver_name = ? AND status = 'pending'
    )`
    params.push(filters.approverId)
  }

  query += ' ORDER BY cr.created_at DESC'

  const requests = db.prepare(query).all(...params) as CheckoutRequest[]

  // Attach approval steps for each request
  for (const request of requests) {
    const steps = db.prepare(`
      SELECT * FROM approval_steps
      WHERE request_id = ?
      ORDER BY step_order ASC
    `).all(request.id) as ApprovalStep[]

    request.approval_steps = steps

    // Find current pending step
    const pendingStep = steps.find(s => s.status === 'pending')
    if (pendingStep) {
      request.current_step = pendingStep.step_order
      request.pending_approver = pendingStep.approver_name
    }
  }

  return requests
  })

  // Get a single checkout request with details
  ipcMain.handle('get-checkout-request', async (_event, id: number) => {
    const db = getDatabase()

  const request = db.prepare(`
    SELECT
      cr.*,
      a.name as asset_name,
      a.asset_tag
    FROM checkout_requests cr
    LEFT JOIN assets a ON cr.asset_id = a.id
    WHERE cr.id = ?
  `).get(id) as CheckoutRequest

  if (!request) {
    throw new Error('Checkout request not found')
  }

  // Get approval steps
  const steps = db.prepare(`
    SELECT * FROM approval_steps
    WHERE request_id = ?
    ORDER BY step_order ASC
  `).all(id) as ApprovalStep[]

  request.approval_steps = steps

  // Find current pending step
  const pendingStep = steps.find(s => s.status === 'pending')
  if (pendingStep) {
    request.current_step = pendingStep.step_order
    request.pending_approver = pendingStep.approver_name
  }

  return request
  })

  // Create a new checkout request
  ipcMain.handle('create-checkout-request', async (_event, input: CheckoutRequestInput) => {
    const db = getDatabase()

  // Get the applicable workflow for this asset
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(input.asset_id) as any
  if (!asset) {
    throw new Error('Asset not found')
  }

  // Find applicable workflow
  const workflow = db.prepare(`
    SELECT * FROM approval_workflows
    WHERE is_active = 1
    AND (
      apply_to_all = 1
      OR category_ids LIKE '%' || ? || '%'
    )
    ORDER BY apply_to_all ASC
    LIMIT 1
  `).get(asset.category_id) as ApprovalWorkflow | undefined

  if (!workflow) {
    throw new Error('No active approval workflow found. Please contact an administrator.')
  }

  // Parse approval chain
  const approvalChain = JSON.parse(workflow.approval_chain) as Array<{ role?: string; name: string }>

  // Create the request
  const result = db.prepare(`
    INSERT INTO checkout_requests (
      asset_id, requested_by, requested_for, checkout_purpose,
      expected_return_date, quantity, notes, status, workflow_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    input.asset_id,
    input.requested_by,
    input.requested_for || null,
    input.checkout_purpose || null,
    input.expected_return_date || null,
    input.quantity || 1,
    input.notes || null,
    workflow.id
  )

  const requestId = result.lastInsertRowid as number

  // Create approval steps based on workflow
  for (let i = 0; i < approvalChain.length; i++) {
    const approver = approvalChain[i]
    db.prepare(`
      INSERT INTO approval_steps (request_id, step_order, approver_name, approver_role, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(requestId, i + 1, approver.name, approver.role || null)
  }

  // Log activity
  db.prepare(`
    INSERT INTO activity_log (activity_type, entity_type, entity_id, entity_name, description, user_name)
    VALUES ('checkout', 'checkout_request', ?, ?, ?, ?)
  `).run(
    requestId,
    asset.name,
    `Checkout request created for ${asset.name} (${asset.asset_tag})`,
    input.requested_by
  )

  // Return the created request
  return db.prepare(`
    SELECT
      cr.*,
      a.name as asset_name,
      a.asset_tag
    FROM checkout_requests cr
    LEFT JOIN assets a ON cr.asset_id = a.id
    WHERE cr.id = ?
  `).get(requestId) as CheckoutRequest
})

// Approve a checkout request
ipcMain.handle('approve-checkout-request', async (_event, requestId: number, decision: ApprovalDecision, approverName: string) => {
  const db = getDatabase()

  // Get the request
  const request = db.prepare('SELECT * FROM checkout_requests WHERE id = ?').get(requestId) as CheckoutRequest
  if (!request) {
    throw new Error('Request not found')
  }

  if (request.status !== 'pending') {
    throw new Error('Request is not pending approval')
  }

  // Find the current pending step for this approver
  const step = db.prepare(`
    SELECT * FROM approval_steps
    WHERE request_id = ? AND approver_name = ? AND status = 'pending'
    ORDER BY step_order ASC
    LIMIT 1
  `).get(requestId, approverName) as ApprovalStep | undefined

  if (!step) {
    throw new Error('No pending approval step found for this approver')
  }

  // Update the approval step
  db.prepare(`
    UPDATE approval_steps
    SET status = 'approved', decision_notes = ?, decided_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(decision.notes || null, step.id)

  // Check if there are more pending steps
  const remainingSteps = db.prepare(`
    SELECT * FROM approval_steps
    WHERE request_id = ? AND status = 'pending'
    ORDER BY step_order ASC
  `).all(requestId) as ApprovalStep[]

  let message = 'Approval recorded successfully.'

  if (remainingSteps.length === 0) {
    // All steps approved! Mark request as approved and create the assignment
    db.prepare('UPDATE checkout_requests SET status = \'approved\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(requestId)

    // Create the actual assignment
    const assignment = db.prepare(`
      INSERT INTO assignments (
        asset_id, assigned_to, assigned_by, checked_out_at,
        expected_return_at, status, checkout_notes
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'active', ?)
    `).run(
      request.asset_id,
      request.requested_for || request.requested_by,
      approverName,
      request.expected_return_date,
      request.notes
    )

    // Update asset status if needed
    db.prepare('UPDATE assets SET status = \'assigned\' WHERE id = ?').run(request.asset_id)

    // Log activity
    db.prepare(`
      INSERT INTO activity_log (activity_type, entity_type, entity_id, entity_name, description, user_name)
      VALUES ('checkout', 'assignment', ?, ?, ?, ?)
    `).run(
      assignment.lastInsertRowid,
      request.asset_name || '',
      `Checkout request approved and asset assigned to ${request.requested_for || request.requested_by}`,
      approverName
    )

    message = 'Request fully approved! Asset has been assigned.'
  } else {
    message = `Approval recorded. Awaiting approval from ${remainingSteps[0].approver_name}.`
  }

  return { success: true, message }
})

// Reject a checkout request
ipcMain.handle('reject-checkout-request', async (_event, requestId: number, decision: ApprovalDecision, approverName: string) => {
  const db = getDatabase()

  // Get the request
  const request = db.prepare('SELECT * FROM checkout_requests WHERE id = ?').get(requestId) as CheckoutRequest
  if (!request) {
    throw new Error('Request not found')
  }

  if (request.status !== 'pending') {
    throw new Error('Request is not pending approval')
  }

  // Find the pending step for this approver
  const step = db.prepare(`
    SELECT * FROM approval_steps
    WHERE request_id = ? AND approver_name = ? AND status = 'pending'
    ORDER BY step_order ASC
    LIMIT 1
  `).get(requestId, approverName) as ApprovalStep | undefined

  if (!step) {
    throw new Error('No pending approval step found for this approver')
  }

  // Update the approval step
  db.prepare(`
    UPDATE approval_steps
    SET status = 'rejected', decision_notes = ?, decided_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(decision.notes || null, step.id)

  // Mark the entire request as rejected
  db.prepare('UPDATE checkout_requests SET status = \'rejected\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(requestId)

  // Skip all remaining pending steps
  db.prepare(`
    UPDATE approval_steps
    SET status = 'skipped'
    WHERE request_id = ? AND status = 'pending'
  `).run(requestId)

  // Log activity
  db.prepare(`
    INSERT INTO activity_log (activity_type, entity_type, entity_id, entity_name, description, user_name)
    VALUES ('checkout', 'checkout_request', ?, ?, ?, ?)
  `).run(
    requestId,
    request.asset_name || '',
    `Checkout request rejected by ${approverName}`,
    approverName
  )

  return { success: true, message: 'Request has been rejected.' }
})

// Cancel a checkout request
ipcMain.handle('cancel-checkout-request', async (_event, requestId: number) => {
  const db = getDatabase()

  const request = db.prepare('SELECT * FROM checkout_requests WHERE id = ?').get(requestId) as CheckoutRequest
  if (!request) {
    throw new Error('Request not found')
  }

  if (request.status !== 'pending') {
    throw new Error('Only pending requests can be cancelled')
  }

  db.prepare('UPDATE checkout_requests SET status = \'cancelled\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(requestId)

  // Skip all pending steps
  db.prepare(`
    UPDATE approval_steps
    SET status = 'skipped'
    WHERE request_id = ? AND status = 'pending'
  `).run(requestId)

  return { success: true }
})

// Get pending approvals for a specific approver
ipcMain.handle('get-pending-approvals-for', async (_event, approverName: string) => {
  const db = getDatabase()

  const requests = db.prepare(`
    SELECT DISTINCT
      cr.*,
      a.name as asset_name,
      a.asset_tag
    FROM checkout_requests cr
    LEFT JOIN assets a ON cr.asset_id = a.id
    INNER JOIN approval_steps ap ON cr.id = ap.request_id
    WHERE cr.status = 'pending'
      AND ap.approver_name = ?
      AND ap.status = 'pending'
    ORDER BY cr.created_at ASC
  `).all(approverName) as CheckoutRequest[]

  // Attach approval steps for each request
  for (const request of requests) {
    const steps = db.prepare(`
      SELECT * FROM approval_steps
      WHERE request_id = ?
      ORDER BY step_order ASC
    `).all(request.id) as ApprovalStep[]

    request.approval_steps = steps

    const pendingStep = steps.find(s => s.status === 'pending')
    if (pendingStep) {
      request.current_step = pendingStep.step_order
      request.pending_approver = pendingStep.approver_name
    }
  }

  return requests
})

// Get all approval workflows
ipcMain.handle('get-approval-workflows', async () => {
  const db = getDatabase()
  return db.prepare('SELECT * FROM approval_workflows ORDER BY is_active DESC, name ASC').all() as ApprovalWorkflow[]
})

// Get active workflow for an asset
ipcMain.handle('get-active-workflow', async (_event, assetId: number) => {
  const db = getDatabase()

  const asset = db.prepare('SELECT category_id FROM assets WHERE id = ?').get(assetId) as { category_id: number } | undefined
  if (!asset) {
    return null
  }

  const workflow = db.prepare(`
    SELECT * FROM approval_workflows
    WHERE is_active = 1
    AND (
      apply_to_all = 1
      OR category_ids LIKE '%' || ? || '%'
    )
    ORDER BY apply_to_all ASC
    LIMIT 1
  `).get(asset.category_id) as ApprovalWorkflow | null

  return workflow
})

// Create a new approval workflow
ipcMain.handle('create-approval-workflow', async (_event, input: ApprovalWorkflowInput) => {
  const db = getDatabase()

  const result = db.prepare(`
    INSERT INTO approval_workflows (
      name, description, is_active, apply_to_all, category_ids,
      min_value, max_value, approval_chain, auto_approve_conditions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.name,
    input.description || null,
    input.is_active ?? 1,
    input.apply_to_all ?? 0,
    input.category_ids || null,
    input.min_value || null,
    input.max_value || null,
    input.approval_chain,
    input.auto_approve_conditions || null
  )

  return db.prepare('SELECT * FROM approval_workflows WHERE id = ?').get(result.lastInsertRowid) as ApprovalWorkflow
})

// Update an approval workflow
ipcMain.handle('update-approval-workflow', async (_event, id: number, updates: Partial<ApprovalWorkflowInput>) => {
  const db = getDatabase()

  const setClauses: string[] = []
  const params: any[] = []

  if (updates.name !== undefined) {
    setClauses.push('name = ?')
    params.push(updates.name)
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?')
    params.push(updates.description)
  }
  if (updates.is_active !== undefined) {
    setClauses.push('is_active = ?')
    params.push(updates.is_active)
  }
  if (updates.apply_to_all !== undefined) {
    setClauses.push('apply_to_all = ?')
    params.push(updates.apply_to_all)
  }
  if (updates.category_ids !== undefined) {
    setClauses.push('category_ids = ?')
    params.push(updates.category_ids)
  }
  if (updates.min_value !== undefined) {
    setClauses.push('min_value = ?')
    params.push(updates.min_value)
  }
  if (updates.max_value !== undefined) {
    setClauses.push('max_value = ?')
    params.push(updates.max_value)
  }
  if (updates.approval_chain !== undefined) {
    setClauses.push('approval_chain = ?')
    params.push(updates.approval_chain)
  }
  if (updates.auto_approve_conditions !== undefined) {
    setClauses.push('auto_approve_conditions = ?')
    params.push(updates.auto_approve_conditions)
  }

  if (setClauses.length === 0) {
    return { success: true }
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)

  db.prepare(`UPDATE approval_workflows SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)

  return { success: true }
})

// Delete an approval workflow
ipcMain.handle('delete-approval-workflow', async (_event, id: number) => {
  const db = getDatabase()

  // Check if workflow is referenced by any pending requests
  const usageCount = db.prepare(`
    SELECT COUNT(*) as count FROM checkout_requests
    WHERE workflow_id = ? AND status = 'pending'
  `).get(id) as { count: number }

  if (usageCount.count > 0) {
    throw new Error('Cannot delete workflow that is referenced by pending checkout requests')
  }

  db.prepare('DELETE FROM approval_workflows WHERE id = ?').run(id)
  return { success: true }
})

// Toggle workflow active status
ipcMain.handle('toggle-workflow-active', async (_event, id: number) => {
  const db = getDatabase()

  db.prepare(`
    UPDATE approval_workflows
    SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id)

  return { success: true }
  })
}
