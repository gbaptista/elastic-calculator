<template>
  <div class="col-6">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">
          {{ name }}
        </h5>
        <div class="card-text">
          {{ readsForThisReplica }} rpm (read)
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
    documents: { type: Number, required: true },
    replicas: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
  },
  computed: {
    readsForThisReplica() {
      return numerify(
        Math.ceil(this.readThroughput / (this.totalOfShards * this.replicas)), '0a',
      );
    },
  },
};
</script>
