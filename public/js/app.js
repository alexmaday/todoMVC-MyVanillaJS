/*global jQuery, Handlebars, Router */
jQuery(function ($) {
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
			todolist.addEventListener('dblclick', this.edit.bind(this));
			todolist.addEventListener('keyup', this.editKeyup.bind(this));
			todolist.addEventListener('focusout', this.update.bind(this));
			todolist.addEventListener('click', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			document.getElementById('todo-list').innerHTML = this.todoTemplate(todos);

			var main = document.getElementById("main");
			if (todos.length > 0) {
				main.style.display = "block";
			} else {
				main.style.display = "none";
			}
			$('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			$('#new-todo').focus();
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

			$('#footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

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
			var id = $(el).closest('li').data('id');    // id is uuid
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			$input.val('');

			this.render();
		},
		/**
		 * .toggleComplete() 
		 * @param: e - event that is being handled
		 */
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
			}
		},
		editKeyup: function (e) {
			if (e.target.matches('.edit')) {
				if (e.which === ENTER_KEY) {
					e.target.blur();
				}
	
				if (e.which === ESCAPE_KEY) {
					$(e.target).data('abort', true).blur();
				}
			}
		},
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


