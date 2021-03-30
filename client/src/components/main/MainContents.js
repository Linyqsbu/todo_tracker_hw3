import React            from 'react';
import TableHeader      from './TableHeader';
import TableContents    from './TableContents';

const MainContents = (props) => {
    return (
        <div className='table ' >
            <TableHeader
                disabled={!props.activeList._id} addItem={props.addItem} 
                setShowDelete={props.setShowDelete} setActiveList={props.setActiveList}
                _id={props.activeList._id} 
                sortItemsByTask={props.sortItemsByTask}
                sortItemsByDueDate={props.sortItemsByDueDate}
                sortItemsByStatus={props.sortItemsByStatus}
                sortItemsByAssignedTo={props.sortItemsByAssignedTo}
                undo={props.undo} redo={props.redo}
                undoable={props.undoable} redoable={props.redoable}
                tps={props.tps}
            />
            <TableContents
                key={props.activeList.id} activeList={props.activeList}
                deleteItem={props.deleteItem} reorderItem={props.reorderItem}
                editItem={props.editItem}
            />
        </div>
    );
};

export default MainContents;