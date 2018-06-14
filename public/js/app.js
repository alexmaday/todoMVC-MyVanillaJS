/*global Handlebars, Router */
document.addEventListener("DOMContentLoaded", function() {

	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-my-vanilla-js');
			this.todoTemplate = Handlebars.compile(document.getElementById('todo-template').innerHTML);
			this.footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML);
			this.bindEvents();

			// Routing is the process of determining what code to 
			// run when a URL is requested.
			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));
			document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));
			document.getElementById('footer').addEventListener('click', this.destroyCompleted.bind(this));

			var todolist = document.getElementById('todo-list');
			todolist.addEventListener('change', this.toggleComplete.bind(this));
			todolist.addEventListener('dblclick', this.edit.bind(this));	// begin editing a todo
			todolist.addEventListener('keyup', this.editKeyup.bind(this));// 
			todolist.addEventListener('focusout', this.update.bind(this));
			todolist.addEventListener('click', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos(); // gets only the todos that should be displayed given the current filter context chosen from within the footer
			document.getElementById('todo-list').innerHTML = this.todoTemplate(todos);
			document.getElementById("main").style.display = (todos.length > 0) ? "block" : "none";
			document.getElementById("toggle-all").checked = this.getActiveTodos().length === 0;

			this.renderFooter();
			document.getElementById("new-todo").focus();
			util.store('todos-my-vanilla-js', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			var footer = document.getElementById("footer")
			footer.style.display = (todoCount > 0) ? "block" : "none";
			footer.innerHTML = template;
		},
		toggleAll: function (e) {
			var isChecked = e.target.checked;

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function (e) {
			// catch the bubble
			if (e.target.matches('button#clear-completed')) {			
				this.todos = this.getActiveTodos();
				this.filter = 'all';
				this.render();
			}
		},
		// accepts an element from inside the #todo-list and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
			var id = el.closest('li').dataset.id;    // id is uuid
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		// called on keyup from input#new-todo
		create: function (e) {
			var val = e.target.value.trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			e.target.value = "";
			this.render();
		},
		toggleComplete: function (e) {
			// begin manually detecting the descendant
			if (e.target.matches('.toggle-complete')) {
				var i = this.indexFromEl(e.target);		// position in the todos array
				this.todos[i].completed = !this.todos[i].completed;
				this.render();
			}
		},
		edit: function (e) {
			if (e.target.matches('label')) {
				var li = e.target.closest('li');
				li.classList.add('editing');
				li.querySelector('.edit').focus();
				// what happens to the label element? Is it explicitly hidden? Is it overlapped by it's sibling input?
				// Yes, the enclosing div.view which holds the label, now has a css rule that sets it's display to none.
				// #todo-list li.editing .view {display: none;}
			}
		},
		// called on keyup inside ul#todo-list
		editKeyup: function (e) {
			if (e.target.matches('.edit')) {
				if (e.which === ENTER_KEY) {
					e.target.blur();	// triggers blur event - handled by .update()
				}
				// what is the intention here?
				// When a user hits Escape
					// set the dataset object property abort to true -> dataset.abort = true
					// triggers a blur event - see .update()
				if (e.key === "Escape") {
					$(e.target).data('abort', true).blur();
				}
			}
		},
		// called on focusout for ul#todo-list
		update: function (e) {
			if (e.target.matches('.edit')) {
				var el = e.target;
				var $el = $(el);
				var val = $el.val().trim();
	
				if (!val) {
					this.destroy(e);
					return;
				}
	
				if ($el.data('abort')) {
					$el.data('abort', false);
				} else {
					this.todos[this.indexFromEl(el)].title = val;
				}
	
				this.render();
			}
		},
		destroy: function (e) {
			if (e.target.matches('.destroy')) {
				this.todos.splice(this.indexFromEl(e.target), 1);
				this.render();
			}
		}
	};

	App.init();
});
