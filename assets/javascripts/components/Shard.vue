<template>
  <div class="col-12">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">
          {{ name }}
        </h5>
        <div class="card-text">
          {{ documentsInThisShards }} documents
          |
          {{ writesInThisShards }} rpm (write)
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numerify from 'numerify';

export default {
  props: {
    name: { type: String, required: true },
    clusters: { type: Number, required: true },
    nodes: { type: Number, required: true },
    documents: { type: Number, required: true },
    shards: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
    replicas: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
  },
  computed: {
    documentsInThisShards() {
      return numerify(Math.ceil(this.documents / this.totalOfShards), '0a');
    },
    writesInThisShards() {
      return numerify(Math.ceil(this.writeThroughput / this.totalOfShards), '0a');
    },
  },
};
</script>
