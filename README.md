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

### On Chrome Dev Console
Any element with an ID can be directly addressed in the console without going through a DOM call.
>> `main`
is the same as 
>> `document.getElementById("main")`

This works when jquery is loaded - does it work without any other libraries?

### On Bubbling
What is 'bubbling'? I know that it is related to how events are handled. 
Bubbling is one of two mechanisms (the other being capturing) that determine the order in which
to run multiple handlers on the same event. For instance, if we have a video element inside a
div element:

```html
<div>
  <video src="something.mp4"></video>
</div>
```

And they both have their own event handlers for the click event:

```javascript
document.querySelector('div').onclick(function(ev) {
  console.log('div responding to click');
});
document.querySelector('video').onclick(function(ev) {
  console.log('video responding to click');
});
```
Which handler runs first? The chicken or the egg? The outside or the inside?

By default, browsers go from the inner to the outer and is referred to as bubbling.
If you want to run handlers from the outside in, you can use capturing by invoking
`ev.stopPropagation()` on the event.

Also, bubbling & capture go from all the way from inside to the outermost ancestor 
html, and from html to all descendants that are listening for that event.
