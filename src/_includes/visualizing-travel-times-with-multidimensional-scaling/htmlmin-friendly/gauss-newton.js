/**
 * Solves a Multidimensional Scaling problem with the Gauss-Newton algorithm.
 *
 * In the returned object, coordinates is a matrix of shape (n, 2) containing
 * the solution.
 *
 * @param {!mlMatrix.Matrix} distances - matrix of shape (n, n) containing the
 *   distances between n points.
 * @param {!number} lr - learning rate / alpha to use.
 * @param {!number} maxSteps - maximum number of update steps.
 * @param {!number} minLossDifference - if the absolute difference between the
 *   losses of the current and the previous optimization step is smaller than
 *   this value, the function will return early.
 * @param {!number} logEvery - if larger than zero, this value determines the
 *   steps between logs to the console.
 * @returns {{coordinates: mlMatrix.Matrix, lossPerStep: number[]}}
 */
function getMdsCoordinatesWithGaussNewton(distances,
                                          {
                                              lr = 0.1,
                                              maxSteps = 200,
                                              minLossDifference = 1e-7,
                                              logEvery = 0
                                          } = {}) {
    const numCoordinates = distances.rows;
    let coordinates = getInitialMdsCoordinates(numCoordinates);
    const dimensions = coordinates.columns;

    const lossPerStep = [];

    for (let step = 0; step &lt; maxSteps; step++) {
        const loss = getMdsLoss(distances, coordinates);
        lossPerStep.push(loss);

        // Check if we should early stop.
        if (lossPerStep.length &gt; 1) {
            const lossPrev = lossPerStep[lossPerStep.length - 2];
            if (Math.abs(lossPrev - loss) &lt; minLossDifference) {
                return {coordinates: coordinates, lossPerStep: lossPerStep};
            }
        }

        if (logEvery &gt; 0 && step % logEvery === 0) {
            console.log(`Step: ${step}, loss: ${loss}`);
        }

        // Apply the update.
        const {residuals, jacobian} = getResidualsWithJacobian(
            distances, coordinates);
        const update = mlMatrix.pseudoInverse(jacobian).mmul(residuals);
        for (let coordIndex = 0; coordIndex &lt; numCoordinates; coordIndex++) {
            for (let dimension = 0; dimension &lt; dimensions; dimension++) {
                const updateIndex = coordIndex * dimensions + dimension;
                const paramValue = coordinates.get(coordIndex, dimension);
                const updateDelta = lr * update.get(updateIndex, 0);
                const updatedValue = paramValue - updateDelta;
                coordinates.set(coordIndex, dimension, updatedValue);
            }
        }
    }

    return {coordinates: coordinates, lossPerStep: lossPerStep};
}

/**
 * Returns the residuals and the Jacobian matrix for performing one step of the
 * Gauss-Newton algorithm.
 *
 * The residuals are returned in a flattened vector as (target - predicted) /
 * numCoordinates. The flattened vector is ordered based on iterating the
 * matrix given by distances in row-major order. We divide by coordinates.rows,
 * so that the sum of squared residuals equals the MDS loss, which involves a
 * division by coordinates.rows ** 2.
 *
 * The element of the Jacobian at row i and column j should contain the
 * partial derivative of the i-th residual w.r.t. the j-th coordinate. The
 * coordinates are indexed in row-major order, such that in two dimensions,
 * the 5th zero-based index corresponds to the second coordinate of the third
 * point.
 *
 * @param {!mlMatrix.Matrix} distances - matrix of shape (n, n) containing the
 *   distances between n points, defining the MDS problem.
 * @param {!mlMatrix.Matrix} coordinates - a matrix of shape (n, d) containing
 *   the current solution, where d is the number of dimensions.
 * @returns {{jacobian: mlMatrix.Matrix, residuals: mlMatrix.Matrix}}
 */
function getResidualsWithJacobian(distances, coordinates) {
    const residuals = [];
    const numCoordinates = coordinates.rows;
    const dimensions = coordinates.columns;
    const jacobian = mlMatrix.Matrix.zeros(
        numCoordinates * numCoordinates,
        numCoordinates * dimensions);

    for (let coordIndex1 = 0;
         coordIndex1 &lt; numCoordinates;
         coordIndex1++) {

        for (let coordIndex2 = 0;
             coordIndex2 &lt; numCoordinates;
             coordIndex2++) {

            if (coordIndex1 === coordIndex2) {
                residuals.push(0);
                // The gradient for all coordinates is zero, so we can skip
                // this row of the Jacobian.
                continue;
            }

            // Compute the residual.
            const coord1 = coordinates.getRowVector(coordIndex1);
            const coord2 = coordinates.getRowVector(coordIndex2);
            const squaredDifferenceSum = mlMatrix.Matrix.sub(
                coord1, coord2).pow(2).sum();
            const predicted = Math.sqrt(squaredDifferenceSum);
            const target = distances.get(coordIndex1, coordIndex2);
            const residual = (target - predicted) / numCoordinates;
            residuals.push(residual);

            // Compute the gradient w.r.t. the first coordinate only. The
            // second coordinate is seen as a constant.
            const residualWrtPredicted = -1 / numCoordinates;
            const predictedWrtSquaredDifferenceSum = 0.5 / Math.sqrt(squaredDifferenceSum);
            const squaredDifferenceSumWrtCoord1 = mlMatrix.Matrix.mul(
                mlMatrix.Matrix.sub(coord1, coord2), 2);
            const residualWrtCoord1 = mlMatrix.Matrix.mul(
                squaredDifferenceSumWrtCoord1,
                residualWrtPredicted * predictedWrtSquaredDifferenceSum
            );

            // Set the corresponding indices in the Jacobian.
            const rowIndex = numCoordinates * coordIndex1 + coordIndex2;
            for (let dimension = 0; dimension &lt; dimensions; dimension++) {
                const columIndex = dimensions * coordIndex1 + dimension;
                const jacobianEntry = jacobian.get(rowIndex, columIndex);
                const entryUpdated = jacobianEntry + residualWrtCoord1.get(
                    0, dimension);
                jacobian.set(rowIndex, columIndex, entryUpdated);
            }
        }
    }
    return {
        residuals: mlMatrix.Matrix.columnVector(residuals),
        jacobian: jacobian
    };
}

/**
 * Initializes the solution by sampling from a uniform distribution, which
 * only allows distances in [0, 1].
 *
 * @param {!number} numCoordinates - the number of points in the solution.
 * @param {!number} dimensions - the number of dimensions of each point.
 * @param {!number} seed - seed for the random number generator.
 * @returns {mlMatrix.Matrix}
 */
function getInitialMdsCoordinates(numCoordinates, dimensions = 2, seed = 0) {
    const randomUniform = mlMatrix.Matrix.rand(
        numCoordinates, dimensions, {random: new Math.seedrandom(seed)});
    return mlMatrix.Matrix.div(randomUniform, Math.sqrt(dimensions));
}

/**
 * Returns the loss of a given solution to the Multidimensional Scaling
 * problem by computing the mean squared difference between target distances
 * and distances between points in the solution.
 *
 * @param {!mlMatrix.Matrix} distances - matrix of shape (n, n) containing the
 *   distances between n points, defining the MDS problem.
 * @param {!mlMatrix.Matrix} coordinates - a matrix of shape (n, d) containing
 *   the solution, for example given by getMdsCoordinatesWithGaussNewton(...).
 *   d is the number of dimensions.
 * @returns {number}
 */
function getMdsLoss(distances, coordinates) {
    // Average the squared differences of target distances and predicted
    // distances.
    let loss = 0;
    const normalizer = Math.pow(coordinates.rows, 2);
    for (let coordIndex1 = 0;
         coordIndex1 &lt; coordinates.rows;
         coordIndex1++) {

        for (let coordIndex2 = 0;
             coordIndex2 &lt; coordinates.rows;
             coordIndex2++) {

            if (coordIndex1 === coordIndex2) continue;

            const coord1 = coordinates.getRowVector(coordIndex1);
            const coord2 = coordinates.getRowVector(coordIndex2);
            const target = distances.get(coordIndex1, coordIndex2);
            const predicted = mlMatrix.Matrix.sub(coord1, coord2).norm();
            loss += Math.pow(target - predicted, 2) / normalizer;
        }
    }
    return loss;
}