import React, { useState, useEffect } 	from 'react';
import Logo 							from '../navbar/Logo';
import NavbarOptions 					from '../navbar/NavbarOptions';
import MainContents 					from '../main/MainContents';
import SidebarContents 					from '../sidebar/SidebarContents';
import Login 							from '../modals/Login';
import Delete 							from '../modals/Delete';
import CreateAccount 					from '../modals/CreateAccount';
import { GET_DB_TODOS } 				from '../../cache/queries';
import * as mutations 					from '../../cache/mutations';
import { useMutation, useQuery } 		from '@apollo/client';
import { WNavbar, WSidebar, WNavItem, WModal } 	from 'wt-frontend';
import { WLayout, WLHeader, WLMain, WLSide } from 'wt-frontend';
import { UpdateListField_Transaction, 
	UpdateListItems_Transaction, 
	ReorderItems_Transaction, 
	EditItem_Transaction, 
	SortItems_Transaction,
	DeleteItem_Transaction,
	AddItem_Transaction} 				from '../../utils/jsTPS';
import WInput from 'wt-frontend/build/components/winput/WInput';


const Homescreen = (props) => {

	let todolists 							= [];
	const [activeList, setActiveList] 		= useState({});
	const [showDelete, toggleShowDelete] 	= useState(false);
	const [showLogin, toggleShowLogin] 		= useState(false);
	const [showCreate, toggleShowCreate] 	= useState(false);

	const [ReorderTodoItems] 		= useMutation(mutations.REORDER_ITEMS);
	const [UpdateTodoItemField] 	= useMutation(mutations.UPDATE_ITEM_FIELD);
	const [UpdateTodolistField] 	= useMutation(mutations.UPDATE_TODOLIST_FIELD);
	const [DeleteTodolist] 			= useMutation(mutations.DELETE_TODOLIST);
	const [DeleteTodoItem] 			= useMutation(mutations.DELETE_ITEM);
	const [AddTodolist] 			= useMutation(mutations.ADD_TODOLIST);
	const [AddTodoItem] 			= useMutation(mutations.ADD_ITEM);
	const [SortItemsByTask]			= useMutation(mutations.SORT_ITEMS_BY_TASK);
	const [SortItemsByDueDate]		= useMutation(mutations.SORT_ITEMS_BY_DUE_DATE);
	const [SortItemsByStatus]		= useMutation(mutations.SORT_ITEMS_BY_STATUS);
	const [SortItemsByAssignedTo]	= useMutation(mutations.SORT_ITEMS_BY_ASSIGNED_TO);
	const [UnsortItems]				= useMutation(mutations.UNSORT_ITEMS);
	const [AddItemWithIndex]		= useMutation(mutations.ADD_ITEM_WITH_INDEX);
	const [MoveListToTop]			= useMutation(mutations.MOVE_LIST_TO_TOP);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	})

	

	const { loading, error, data, refetch } = useQuery(GET_DB_TODOS);
	if(loading) { console.log(loading, 'loading'); }
	if(error) { console.log(error, 'error'); }
	if(data) { todolists = data.getAllTodos; }

	const auth = props.user === null ? false : true;

	const refetchTodos = async (refetch) => {
		const { loading, error, data } = await refetch();
		if (data) {
			todolists = data.getAllTodos;
			if (activeList._id) {
				let tempID = activeList._id;
				let list = todolists.find(list => list._id === tempID);
				setActiveList(list);

			}
		}
	}

	const tpsUndo = async () => {
		const retVal = await props.tps.undoTransaction();
		refetchTodos(refetch);
		return retVal;
	}

	const tpsRedo = async () => {
		const retVal = await props.tps.doTransaction();
		refetchTodos(refetch);
		return retVal;
	}

	const handleKeyDown = async (event) => {
		if(event.ctrlKey){
			if(event.keyCode===90){
				if(props.tps.hasTransactionToUndo()){
					tpsUndo();
				}
			}

			if(event.keyCode===89){
				if(props.tps.hasTransactionToRedo()){
					tpsRedo();
				}
			}
		}
	}

	
	// Creates a default item and passes it to the backend resolver.
	// The return id is assigned to the item, and the item is appended
	//  to the local cache copy of the active todolist. 
	const addItem = async () => {
		let list = activeList;
		const items = list.items;

		
		var highestId=0;
		for(let i=0;i<activeList.items.length;i++){
			if(activeList.items[i].id>=highestId){
				highestId=activeList.items[i].id+1;
			}
		}

		const newItem = {
			_id: '',
			id: highestId,
			description: 'No Description',
			due_date: 'No Date',
			assigned_to: "Unknown",
			completed: false
		};
		let opcode = 1;
		let itemID = newItem._id;
		let listID = activeList._id;
		let transaction = new UpdateListItems_Transaction(listID, itemID, newItem, opcode, AddTodoItem, DeleteTodoItem);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};
	



	const deleteItem = async (item) => {
		let listID = activeList._id;
		let itemID = item._id;
		let opcode=0;
		let itemToDelete = {
			_id: item._id,
			id: item.id,
			description: item.description,
			due_date: item.due_date,
			assigned_to: item.assigned_to,
			completed: item.completed
		}
		let index;
		for(let i=0;i<activeList.items.length;i++){
			if(item.id===activeList.items[i].id){
				index=i;
				break;
			}
		}
		
		let transaction = new UpdateListItems_Transaction(listID, itemID, itemToDelete, opcode, AddItemWithIndex, DeleteTodoItem, index);
		//let transaction = new DeleteItem_Transaction(listID, itemID, item, index, DeleteTodoItem, AddItemWithIndex);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	

	const editItem = async (itemID, field, value, prev) => {
		let flag = 0;
		if (field === 'completed') flag = 1;
		let listID = activeList._id;
		let transaction = new EditItem_Transaction(listID, itemID, field, prev, value, flag, UpdateTodoItemField);
		props.tps.addTransaction(transaction);
		tpsRedo();

	};

	const reorderItem = async (itemID, dir) => {
		let listID = activeList._id;
		let transaction = new ReorderItems_Transaction(listID, itemID, dir, ReorderTodoItems);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	const sortItemsByTask = async () => {
		if(activeList.items){
			let  oldListItems = activeList.items.map((item) => {
				let newItem={
					_id: item._id,
					id: item.id,
					description: item.description,
					due_date: item.due_date,
					assigned_to: item.assigned_to,
					completed: item.completed
				};
				return newItem;
			});
			
			let listId=activeList._id;
			let transaction = new SortItems_Transaction(listId, SortItemsByTask, UnsortItems, oldListItems);
			props.tps.addTransaction(transaction);
			tpsRedo();
		}
	};

	const sortItemsByDueDate = async () => {
		
		if(activeList.items){

			let  oldListItems = activeList.items.map((item) => {
				let newItem={
					_id: item._id,
					id: item.id,
					description: item.description,
					due_date: item.due_date,
					assigned_to: item.assigned_to,
					completed: item.completed
				};
				return newItem;
			});
			let listId=activeList._id;
			let transaction = new SortItems_Transaction(listId, SortItemsByDueDate, UnsortItems, oldListItems);
			props.tps.addTransaction(transaction);
			tpsRedo();
		}
	}

	const sortItemsByStatus = async () => {
		if(activeList.items){
			let  oldListItems = activeList.items.map((item) => {
				let newItem={
					_id: item._id,
					id: item.id,
					description: item.description,
					due_date: item.due_date,
					assigned_to: item.assigned_to,
					completed: item.completed
				};
				return newItem;
			});
			let listId=activeList._id;
			let transaction = new SortItems_Transaction(listId, SortItemsByStatus, UnsortItems, oldListItems);
			props.tps.addTransaction(transaction);
			tpsRedo();
		}
	}

	const sortItemsByAssignedTo = async () => {
		if(activeList.items){
			let  oldListItems = activeList.items.map((item) => {
				let newItem={
					_id: item._id,
					id: item.id,
					description: item.description,
					due_date: item.due_date,
					assigned_to: item.assigned_to,
					completed: item.completed
				};
				return newItem;
			});
			let listId=activeList._id;
			let transaction = new SortItems_Transaction(listId, SortItemsByAssignedTo, UnsortItems, oldListItems);
			props.tps.addTransaction(transaction);
			tpsRedo();
		}
	}


	const createNewList = async () => {
		const length = todolists.length;
		const id = length >= 1 ? todolists[length - 1].id + Math.floor((Math.random() * 100) + 1) : 1;
		let list = {
			_id: '',
			id: id,
			name: 'Untitled',
			owner: props.user._id,
			isTopList:false,
			items: [],
		}
		const { data } = await AddTodolist({ variables: { todolist: list }, refetchQueries: [{ query: GET_DB_TODOS }] });
		let listId = data.addTodolist;
		await refetchTodos(refetch);
		const todo = todolists.find(todo => todo._id == listId);
		console.log(todolists);
		console.log(listId);
		console.log(todo);
		handleSetActive(listId);
		props.tps.clearAllTransactions();
	};

	const deleteList = async (_id) => {
		DeleteTodolist({ variables: { _id: _id }, refetchQueries: [{ query: GET_DB_TODOS }] });
		refetch();
		setActiveList({});
		props.tps.clearAllTransactions();
	};
	

	const updateListField = async (_id, field, value, prev) => {
		let transaction = new UpdateListField_Transaction(_id, field, prev, value, UpdateTodolistField);
		props.tps.addTransaction(transaction);
		tpsRedo();

	};

	const handleSetActive = async (id) => {
		const lastActiveList = todolists.find(todo => todo.isTopList);
		let lastActiveListId;
		if(lastActiveList)
			lastActiveListId=lastActiveList._id
		const {data} = await MoveListToTop({variables:{activeId:lastActiveListId, _id:id}});
		await refetchTodos(refetch);
		const todo = todolists.find(todo => todo._id == id);
		setActiveList(todo);
		console.log(todo.name);
		props.tps.clearAllTransactions();
	};

	

	
	/*
		Since we only have 3 modals, this sort of hardcoding isnt an issue, if there
		were more it would probably make sense to make a general modal component, and
		a modal manager that handles which to show.
	*/
	const setShowLogin = () => {
		toggleShowDelete(false);
		toggleShowCreate(false);
		toggleShowLogin(!showLogin);
	};

	const setShowCreate = () => {
		toggleShowDelete(false);
		toggleShowLogin(false);
		toggleShowCreate(!showCreate);
	};

	const setShowDelete = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDelete(!showDelete)
	}

	

	return (
		<WLayout wLayout="header-lside">
			<WLHeader>
				<WNavbar color="colored">
					<ul>
						<WNavItem>
							<Logo className='logo' />
						</WNavItem>
					</ul>
					<ul>
						<NavbarOptions
							fetchUser={props.fetchUser} auth={auth} 
							setShowCreate={setShowCreate} setShowLogin={setShowLogin}
							refetchTodos={refetch} setActiveList={setActiveList}
						/>
					</ul>
				</WNavbar>
			</WLHeader>

			<WLSide side="left">
				<WSidebar>
					{
						activeList ?
							<SidebarContents
								todolists={todolists} activeid={activeList._id} auth={auth}
								handleSetActive={handleSetActive} createNewList={createNewList}
								
								updateListField={updateListField}
							/>
							:
							<></>
					}
				</WSidebar>
			</WLSide>
			<WLMain>
				{
					activeList ? 
							<div className="container-secondary">
								<MainContents
									addItem={addItem} deleteItem={deleteItem}
									editItem={editItem} reorderItem={reorderItem}
									setShowDelete={setShowDelete} 
									activeList={activeList} setActiveList={setActiveList}
									sortItemsByTask={sortItemsByTask}
									sortItemsByDueDate={sortItemsByDueDate}
									sortItemsByStatus={sortItemsByStatus}
									sortItemsByAssignedTo={sortItemsByAssignedTo}
									undo={tpsUndo} redo={tpsRedo}
									tps={props.tps}
								/>
							</div>
						:
							<div className="container-secondary" />
				}

			</WLMain>

			{
				showDelete && (<div className="modal-overlay">
								<Delete deleteList={deleteList} activeid={activeList._id} setShowDelete={setShowDelete} />
								</div>)
			}

			{
				showCreate && (<div className="modal-overlay">
								<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />
								</div>)
			}

			{
				showLogin && (<div className="modal-overlay">
								<Login fetchUser={props.fetchUser} refetchTodos={refetch} setShowLogin={setShowLogin} />
								</div>)
			}

		</WLayout>
	);
};

export default Homescreen;