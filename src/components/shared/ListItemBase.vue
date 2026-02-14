<template>
  <div class="list-item-base">
    <slot name="header"></slot>
    <slot name="form"></slot>
  </div>
</template>

<style scoped>
.list-item-base {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.list-item-base .item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.list-item-base .drag-handle {
  cursor: move;
  color: #9ca3af;
}

.list-item-base .drag-handle:hover {
  color: #6b7280;
}
</style>
