function getMdsLossTf(t,e){return getMdsLossTfFunction(t,tf.tensor2d(e.to2DArray(),[e.rows,e.columns]))}function getMdsLossTfFunction(t,e){const n=e.shape[0];let r=tf.scalar(0);for(let f=0;f<n;f++)for(let o=0;o<n;o++){if(f===o)continue;const s=tf.gather(e,[f]),a=tf.gather(e,[o]),c=t.get(f,o),d=tf.sqrt(tf.sum(tf.squaredDifference(s,a))),u=tf.div(tf.squaredDifference(c,d),Math.pow(n,2));r=tf.add(r,u)}return r}function getGradientForCoordinateTf(t,e,n){const r=tf.tensor2d(e.to2DArray(),[e.rows,e.columns]),f=tf.grad(e=>getMdsLossTfFunction(t,e))(r);return tf.gather(f,[n]).dataSync()}