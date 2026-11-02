<script setup lang="ts">
import { ref } from 'vue'

import { useProgressStore } from '@/entities/progress'

const progress = useProgressStore()

const newName = ref('')
const editing = ref<{ id: string; name: string } | null>(null)
const removing = ref<{ id: string; name: string } | null>(null)
const confirmDialog = ref<HTMLDialogElement | null>(null)

function add() {
  if (!newName.value.trim()) return
  progress.addChild(newName.value)
  newName.value = ''
}

function startEdit(id: string, name: string) {
  editing.value = { id, name }
}

function saveEdit() {
  if (editing.value) progress.renameChild(editing.value.id, editing.value.name)
  editing.value = null
}

function askRemove(id: string, name: string) {
  removing.value = { id, name }
  confirmDialog.value?.showModal()
}

function closeDialog() {
  confirmDialog.value?.close()
  removing.value = null
}

function confirmRemove() {
  if (removing.value) progress.removeChild(removing.value.id)
  closeDialog()
}
</script>

<template>
  <div class="manage-children">
    <ul class="manage-children__list">
      <li v-for="child in progress.children" :key="child.id" class="manage-children__item">
        <form v-if="editing?.id === child.id" class="manage-children__form" @submit.prevent="saveEdit">
          <InputText v-model="editing.name" size="small" aria-label="Имя ребёнка" maxlength="40" />
          <Button type="submit" label="Сохранить" size="small" />
          <Button label="Отмена" severity="secondary" variant="text" size="small" @click="editing = null" />
        </form>
        <template v-else>
          <span class="manage-children__name">
            <i class="pi pi-user" aria-hidden="true" />
            {{ child.name }}
            <span v-if="child.id === progress.activeChildId" class="manage-children__active">занимается сейчас</span>
          </span>
          <span class="manage-children__actions">
            <Button
              v-if="child.id !== progress.activeChildId"
              label="Выбрать"
              severity="secondary"
              variant="text"
              size="small"
              @click="progress.selectChild(child.id)"
            />
            <Button
              icon="pi pi-pencil"
              :aria-label="`Переименовать: ${child.name}`"
              severity="secondary"
              variant="text"
              size="small"
              @click="startEdit(child.id, child.name)"
            />
            <Button
              v-if="progress.children.length > 1"
              icon="pi pi-trash"
              :aria-label="`Удалить профиль: ${child.name}`"
              severity="danger"
              variant="text"
              size="small"
              @click="askRemove(child.id, child.name)"
            />
          </span>
        </template>
      </li>
    </ul>

    <form class="manage-children__form" @submit.prevent="add">
      <InputText v-model="newName" size="small" placeholder="Имя ребёнка" aria-label="Имя нового ребёнка" maxlength="40" />
      <Button type="submit" label="Добавить" icon="pi pi-plus" size="small" :disabled="!newName.trim()" />
    </form>

    <dialog ref="confirmDialog" class="manage-children__dialog" aria-labelledby="remove-child-title">
      <h2 id="remove-child-title" class="manage-children__dialog-title">Удалить профиль «{{ removing?.name }}»?</h2>
      <p class="manage-children__dialog-text">Весь прогресс этого ребёнка будет удалён, в том числе из аккаунта. Это нельзя отменить.</p>
      <div class="manage-children__dialog-actions">
        <Button label="Отмена" severity="secondary" variant="text" @click="closeDialog" />
        <Button label="Удалить" severity="danger" @click="confirmRemove" />
      </div>
    </dialog>
  </div>
</template>

<style lang="sass" scoped>
@use './ManageChildren'
</style>
