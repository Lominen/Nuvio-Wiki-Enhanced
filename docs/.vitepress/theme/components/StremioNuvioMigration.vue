<script setup lang="ts">
import MediaSyncBridge from './MediaSyncBridge.vue'
import {
  STREMIO_NUVIO_MIGRATION_DESTINATION,
  STREMIO_NUVIO_MIGRATION_SOURCE
} from './stremioNuvioMigration.ts'
</script>

<template>
  <MediaSyncBridge
    default-expanded
    default-addon-migration-selected
    hide-tip
    hide-header
    lock-route
    enable-addon-migration
    migration-mode
    :source-service="STREMIO_NUVIO_MIGRATION_SOURCE"
    :destination-service="STREMIO_NUVIO_MIGRATION_DESTINATION"
  />
</template>
