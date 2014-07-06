function Promise() {

    var resolved = false
    var resolvedWith = undefined
    var callbacks = []

    this.resolve = function(data) {

        setTimeout(function() {
            callbacks.forEach(function(callback) {
                callback(data)
            })
        })

        resolved = true
        resolvedWith = data

    }

    this.then = function(f) {
        if (!resolved) {
            callbacks.push(f)
        } else {
            setTimeout(function() {
                f(resolvedWith)
            })
        }

        return this
    }


}
