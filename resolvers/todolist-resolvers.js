const ObjectId = require('mongoose').Types.ObjectId;
const Todolist = require('../models/todolist-model');

// The underscore param, "_", is a wildcard that can represent any value;
// here it is a stand-in for the parent parameter, which can be read about in
// the Apollo Server documentation regarding resolvers

module.exports = {
	Query: {
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of todolist objects on success, and an empty array on failure
		**/
		getAllTodos: async (_, __, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const todolists = await Todolist.find({owner: _id});
			if(todolists) return (todolists);

		},
		/** 
		 	@param 	 {object} args - a todolist id
			@returns {object} a todolist on success and an empty object on failure
		**/
		getTodoById: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const todolist = await Todolist.findOne({_id: objectId});
			if(todolist) return todolist;
			else return ({});
		},
	},
	Mutation: {
		/** 
		 	@param 	 {object} args - a todolist id and an empty item object
			@returns {string} the objectID of the item or an error message
		**/
		addItem: async(_, args) => {
			const { _id, item, index } = args;
			const listId = new ObjectId(_id);
			const objectId = new ObjectId();
			const found = await Todolist.findOne({_id: listId});
			if(!found) return ("Todolist not fosund");
			item._id = objectId;
			let listItems = found.items;
			if(index){
				console.log(index)
				listItems.splice(index, 0, item);
			}
			else
				listItems.push(item);
			
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems });

			if(updated) return (objectId);
			else return ('could not find item');
		},

		addItemWithIndex: async(_, args) => {
			const {_id, item, index} = args;
			const listId = new ObjectId(_id);
			let objectId = new ObjectId(item._id);
			const found = await Todolist.findOne({_id:listId});
			if(!found) return ("Todolist not found");
			let listItems=found.items;
			listItems.splice(index, 0, item);

			const updated = await Todolist.updateOne({_id:listId}, {items:listItems});
			if(updated) return (objectId);
			else return ('could not find item');
		},

		/** 
		 	@param 	 {object} args - an empty todolist object
			@returns {string} the objectID of the todolist or an error message
		**/
		addTodolist: async (_, args) => {
			const { todolist } = args;
			const objectId = new ObjectId();
			const { id, name, owner, items } = todolist;
			const newList = new Todolist({
				_id: objectId,
				id: id,
				name: name,
				owner: owner,
				items: items
			});
			const updated = newList.save();
			if(updated) return objectId;
			else return ('Could not add todolist');
		},
		/** 
		 	@param 	 {object} args - a todolist objectID and item objectID
			@returns {array} the updated item array on success or the initial 
							 array on failure
		**/
		deleteItem: async (_, args) => {
			const  { _id, itemId } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			listItems = listItems.filter(item => item._id.toString() !== itemId);
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);

		},
		/** 
		 	@param 	 {object} args - a todolist objectID 
			@returns {boolean} true on successful delete, false on failure
		**/
		deleteTodolist: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const deleted = await Todolist.deleteOne({_id: objectId});
			if(deleted) return true;
			else return false;
		},
		/** 
		 	@param 	 {object} args - a todolist objectID, field, and the update value
			@returns {boolean} true on successful update, false on failure
		**/
		updateTodolistField: async (_, args) => {
			const { field, value, _id } = args;
			const objectId = new ObjectId(_id);
			const updated = await Todolist.updateOne({_id: objectId}, {[field]: value});
			if(updated) return value;
			else return "";
		},
		/** 
			@param	 {object} args - a todolist objectID, an item objectID, field, and
									 update value. Flag is used to interpret the completed 
									 field,as it uses a boolean instead of a string
			@returns {array} the updated item array on success, or the initial item array on failure
		**/
		updateItemField: async (_, args) => {
			const { _id, itemId, field,  flag } = args;
			let { value } = args
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			if(flag === 1) {
				if(value === 'complete') { value = true; }
				if(value === 'incomplete') { value = false; }
			}
			listItems.map(item => {
				if(item._id.toString() === itemId) {	
					
					item[field] = value;
				}
			});
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);
		},
		/**
			@param 	 {object} args - contains list id, item to swap, and swap direction
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		reorderItems: async (_, args) => {
			const { _id, itemId, direction } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			const index = listItems.findIndex(item => item._id.toString() === itemId);
			// move selected item visually down the list
			if(direction === 1 && index < listItems.length - 1) {
				let next = listItems[index + 1];
				let current = listItems[index]
				listItems[index + 1] = current;
				listItems[index] = next;
			}
			// move selected item visually up the list
			else if(direction === -1 && index > 0) {
				let prev = listItems[index - 1];
				let current = listItems[index]
				listItems[index - 1] = current;
				listItems[index] = prev;
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			// return old ordering if reorder was unsuccessful
			listItems = found.items;
			return (found.items);
		},

		/**
		 * 
		 * @param {*} args - contains the list id
		 * @returns {array} - sorted array
		 */
		sortItemsByTask: async (_, args) => {
			const { _id} = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems=found.items;
			
			let sorted=true;
			for(let i=1;i<listItems.length;i++){
				if(listItems[i].description.localeCompare(listItems[i-1].description)<0){
					sorted=false;
					break;
				}
			}

			if(!sorted){
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].description.localeCompare(key.description)>0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					listItems[j+1]=key;
				}
			}

			else{
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].description.localeCompare(key.description)<0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					
					listItems[j+1]=key;
				}
			}
			const updated=await Todolist.updateOne({_id:listId}, {items:listItems});
			if(updated) return (listItems);
			else return (found.items);	
			
		},
	

		sortItemsByDueDate: async (_, args) => {
			const {_id}=args;
			const listId = new ObjectId(_id);
			const found=await Todolist.findOne({_id:listId});
			let listItems=found.items;
			let sorted=true;
			for(let i=1;i<listItems.length;i++){
				if(listItems[i].due_date.localeCompare(listItems[i-1].due_date)<0){
					sorted=false;
					break;
				}
			}

			if(!sorted){
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].due_date.localeCompare(key.due_date)>0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					listItems[j+1]=key;
				}
			}

			else{
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].due_date.localeCompare(key.due_date)<0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					
					listItems[j+1]=key;
				}
			}
			const updated=await Todolist.updateOne({_id:listId}, {items:listItems});
			if(updated) return listItems;
			else return found.items;
		},

		sortItemsByStatus: async (_, args) => {
			const {_id}=args;
			const listId=new ObjectId(_id);
			const found=await Todolist.findOne({_id:listId});
			let listItems=found.items;
			let sorted=true;
			for(let i=1;i<listItems.length;i++){
				if(!listItems[i].completed && listItems[i-1].completed){ //if complete is on top of incomplete, then the list is not sorted
					sorted=false;
					break;
				}
			}

			if(!sorted){
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j=i-1;
					while(j>=0 && listItems[j].completed && !key.completed){
						listItems[j+1]=listItems[j];
						j -= 1;
					}
					listItems[j+1]=key
				}
			}

			else{
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j=i-1;
					while(j>=0 && !listItems[j].completed && key.completed){
						listItems[j+1]=listItems[j];
						j -= 1;
					}
					listItems[j+1]=key
				}
			}
			const updated = await Todolist.updateOne({_id:listId}, {items:listItems});
			if(updated) return listItems;
			else return found.items;
		},

		sortItemsByAssignedTo: async (_, args) => {
			const {_id}=args;
			const listId = new ObjectId(_id);
			const found=await Todolist.findOne({_id:listId});
			let listItems=found.items;
			let sorted=true;
			for(let i=1;i<listItems.length;i++){
				if(listItems[i].assigned_to.localeCompare(listItems[i-1].assigned_to)<0){
					sorted=false;
					break;
				}
			}

			if(!sorted){
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].assigned_to.localeCompare(key.assigned_to)>0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					listItems[j+1]=key;
				}
			}

			else{
				for(let i=1;i<listItems.length;i++){
					let key=listItems[i];
					let j = i-1;
					
					while(j>=0 && listItems[j].assigned_to.localeCompare(key.assigned_to)<0){
						listItems[j+1]=listItems[j];
						j-=1;
					}
					listItems[j+1]=key;
				}
			}
			const updated=await Todolist.updateOne({_id:listId}, {items:listItems});
			if(updated) return listItems;
			else return found.items;
		},

		unsortItems: async (_, args) => {
			const {_id, oldListItems} = args;
			const listId = new ObjectId(_id);
			const found= await Todolist.findOne({_id:listId});
			const updated = await Todolist.updateOne({_id:listId}, {items:oldListItems});
			if(updated) return oldListItems;
			else return found.items;
		}
		
	}
}