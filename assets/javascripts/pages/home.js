import Vue from 'vue';

import numerify from 'numerify';
import numerifyBytes from 'numerify/lib/plugins/bytes.umd';
import Cluster from '../components/Cluster.vue';

numerify.register('bytes', numerifyBytes);

const app = new Vue({
  el: '#app',
  components: { Cluster },
  data: {
    writeThroughput: 500,
    readThroughput: 3000,
    documents: 1000000,
    gbSize: 10,
    clusters: 1,
    deticatedNodes: 1,
    nodes: 3,
    shards: 1,
    replicas: 1,
  },
  computed: {
    formattedSize() {
      // * MB * Bytes
      return numerify(this.gbSize * 1000 * 1000000, '0.0b');
    },
    formattedDocuments() {
      return numerify(this.documents, '0.0a');
    },
    formattedReadThroughput() {
      return numerify(this.readThroughput, '0.0a');
    },
    formattedWriteThroughput() {
      return numerify(this.writeThroughput, '0.0a');
    },
  },
  methods: {
    safeInt(value) {
      const intValue = parseInt(value, 10);

      if (Number.isNaN(intValue) || intValue < 0) {
        return 0;
      }

      return intValue;
    },
  },
});

if (app == null) {
  throw new Error('Vue app not initialized.');
}
