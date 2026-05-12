import { type ExtendedRecordMap } from 'notion-types'

type RecordTable = Record<string, Record<string, unknown>>

const hasNestedValue = (
  value: unknown
): value is { role?: unknown; value: Record<string, unknown> } =>
  !!value &&
  typeof value === 'object' &&
  'value' in value &&
  !!(value as { value?: unknown }).value &&
  typeof (value as { value?: unknown }).value === 'object'

export function normalizeNotionRecordMap(
  recordMap: ExtendedRecordMap
): ExtendedRecordMap {
  for (const table of Object.values(recordMap) as RecordTable[]) {
    if (!table || typeof table !== 'object' || Array.isArray(table)) {
      continue
    }

    for (const [id, record] of Object.entries(table)) {
      if (!hasNestedValue(record?.value)) {
        continue
      }

      table[id] = {
        ...record,
        role: record.value.role ?? record.role,
        value: record.value.value
      }
    }
  }

  return recordMap
}
