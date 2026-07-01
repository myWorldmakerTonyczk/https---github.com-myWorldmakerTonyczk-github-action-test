<script setup lang="ts">
import { data } from '../../posts/posts.data.mts'
import { withBase } from 'vitepress'

const posts = data
</script>

<template>
  <div class="post-feed">
    <a
      v-for="post in posts"
      :key="post.url"
      :href="withBase(post.url)"
      class="post-card"
    >
      <p class="post-title">{{ post.title }}</p>
      <p class="post-date">{{ post.date }} · {{ post.author }}</p>
      <p class="post-excerpt">{{ post.excerpt }}</p>
    </a>
  </div>
</template>

<style scoped>
.post-feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.post-card {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.25s, transform 0.25s;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
}

.post-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
}

.post-card .post-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.post-card:hover .post-title {
  color: var(--vp-c-brand);
}

.post-card .post-date {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.post-card .post-excerpt {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}
</style>
