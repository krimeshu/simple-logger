class ThrowError {
    doIt() {
        throw new Error('Error occured in babeled script.');
    }
}

window.throwBabelError = function () {
    new ThrowError().doIt();
}