<template>
  <div class="col-12 col-sm-12 col-md-12 col-lg-6">
    <div class="card card-replica">
      <div class="card-header">
        {{ name }}
      </div>
      <div class="card-body">
        <span class="badge badge-pill badge-info">read: {{ readsForThisReplica }} rpm</span>
      </div>
    </div>
  </div>
</template>

<script>
import numerify from 'numerify';

export default {
  props: {
    name: { type: String, required: true },
    documents: { type: Number, required: true },
    replicas: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
  },
  computed: {
    readsForThisReplica() {
      return numerify(
        Math.ceil(this.readThroughput / (this.totalOfShards * (this.replicas + 1))), '0a',
      );
    },
  },
};
</script>
