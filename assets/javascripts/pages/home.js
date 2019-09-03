import Vue from 'vue';

import numerify from 'numerify';
import Cluster from '../components/Cluster.vue';


const app = new Vue({
  el: '#app',
  components: { Cluster },
  data: {
    writeThroughput: 1000,
    readThroughput: 1500,
    documents: 4000000,
    clusters: 1,
    deticatedNodes: 1,
    nodes: 3,
    shards: 3,
    replicas: 2,
  },
  computed: {
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
