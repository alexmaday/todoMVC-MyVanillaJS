**TodoMVC-myVanillaJS**

This is my attempt to refactor all existing jQuery into vanilla JS.

## General Topic Notes

### On localStorage 

localStorage has two methods:
1. `setItem(namespace, <string> data)` writes string data to the namespace. All writes are overwrites; there is no append, or insert etc. It's all one big string
2. `.getItem(namespace)` returns a string if the namespace exists or null if it doesn't


```javascript
/**
 * Here, localStorage in util.store
 **/
store: function (namespace, data) {
  if (arguments.length > 1) {
    // we've got both params so write our data
    return localStorage.setItem(namespace, JSON.stringify(data));
    // otherwise, read
  } else {
    // getItem returns one of: (null | "[]" | parsed JSON)
    var store = localStorage.getItem(namespace);
    // null is returned if the namespace has never been written to, or is empty
    // return JSON.parse(localStorage.getItem()) || []
    return (store && JSON.parse(store)) || [];
  }
}

```

### On `this`

per kyle simpson's this & object prototypes page ...


### jQuery Tidbits

In jQuery, there are three methods that control the visibility of an element(s). We are interested in only 1:
`.toggle(display)`
**display**
Type: Boolean
Use `true` to show the element for `false` to hide it
