<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useSessionStore } from '@/entities/session'
import { contentPath, fetchBundledGrade, findSubject, GRADES, parseOverride } from '@/entities/subject'
import { adminPath, ContentEditor, useAdminStore } from '@/features/edit-content'
import { fetchPublicData } from '@/shared/lib'

import type { Grade, GradeOverride } from '@/entities/subject'

const session = useSessionStore()
const admin = useAdminStore()

session.init()

const gradeOptions = GRADES.map((grade) => ({
  value: grade.id,
  label: `${findSubject(grade.subjectId)?.title ?? grade.subjectId}, ${grade.grade} класс`,
}))

const selectedId = ref<string | null>(null)
const grade = ref<Grade | null>(null)
const override = ref<GradeOverride | null>(null)
const loading = ref(false)
/** Bumped after saving, so the editor restarts from what is now in the database. */
const version = ref(0)

const canEdit = computed(() => admin.isAdmin === true)

async function load(id: string) {
  loading.value = true
  try {
    const [bundled, raw] = await Promise.all([fetchBundledGrade(id), fetchPublicData(contentPath(id))])
    if (selectedId.value !== id) return
    grade.value = bundled
    override.value = parseOverride(raw)
    version.value += 1
  } finally {
    loading.value = false
  }
}

watch(selectedId, (id) => {
  grade.value = null
  if (id) void load(id)
})
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__head">
      <h1 class="admin-page__title">Редактор тестов и контрольных</h1>
      <p class="admin-page__lead">
        Правки сохраняются в базу и сразу видны всем ученикам. Темы и упражнения правятся в файлах класса в репозитории;
        здесь можно скачать JSON класса с вашими правками.
      </p>
    </header>

    <Message v-if="!session.available" severity="warn">
      Firebase не настроен: заполните переменные VITE_FIREBASE_* (см. README), иначе сохранять правки некуда.
    </Message>

    <section v-else-if="!session.user" class="admin-page__gate">
      <p>Войдите через Google аккаунтом администратора.</p>
      <Button label="Войти через Google" icon="pi pi-google" :loading="session.busy" @click="session.signIn()" />
      <Message v-if="session.error" severity="error" size="small">{{ session.error }}</Message>
    </section>

    <section v-else-if="admin.isAdmin === null" class="admin-page__gate" role="status">
      <ProgressSpinner style="width: 2rem; height: 2rem" stroke-width="6" />
      Проверяем права…
    </section>

    <section v-else-if="!canEdit" class="admin-page__gate">
      <p>У аккаунта <b>{{ session.user.email }}</b> нет прав администратора.</p>
      <p class="admin-page__hint">
        Чтобы их выдать, в Firebase Console → Realtime Database добавьте запись
        <code>{{ adminPath(session.user.uid) }}</code> со значением <code>true</code>.
      </p>
      <Button label="Выйти" icon="pi pi-sign-out" severity="secondary" variant="outlined" @click="session.signOut()" />
    </section>

    <template v-else>
      <div class="admin-page__toolbar">
        <Select
          v-model="selectedId"
          :options="gradeOptions"
          option-label="label"
          option-value="value"
          placeholder="Выберите класс"
          filter
          class="admin-page__select"
          aria-label="Класс"
        />
        <span class="admin-page__hint">{{ session.user.email }}</span>
        <Button label="Выйти" icon="pi pi-sign-out" severity="secondary" variant="text" size="small" @click="session.signOut()" />
      </div>

      <div v-if="loading" role="status"><Skeleton height="12rem" /></div>
      <ContentEditor
        v-else-if="grade && selectedId"
        :key="`${selectedId}:${version}`"
        :grade="grade"
        :override="override"
        @changed="load(selectedId)"
      />
    </template>
  </div>
</template>

<style lang="sass" scoped>
@use './AdminPage'
</style>
