import React, { useState } from 'react';
import { WButton, WInput, WRow, WCol } from 'wt-frontend';

const TableEntry = (props) => {
    const { data } = props;

    const completeStyle = data.completed ? ' complete-task' : ' incomplete-task';
    const assignedToColor = data.completed? 'black':'red';
    const moveupButtonStyle = props.moveupdable ? "table-entry-buttons" : "table-entry-buttons-disabled";
    const movedownButtonStyle = props.movedownable ? "table-entry-buttons" : "table-entry-buttons-disabled";
    const description = data.description;
    const due_date = data.due_date;
    const status = data.completed ? 'complete' : 'incomplete';
    const assigned_to = data.assigned_to;
    const [editingDate, toggleDateEdit] = useState(false);
    const [editingDescr, toggleDescrEdit] = useState(false);
    const [editingStatus, toggleStatusEdit] = useState(false);
    const [editingAssign, toggleAssignEdit]    = useState(false);

    const handleDateEdit = (e) => {
        toggleDateEdit(false);
        const newDate = e.target.value ? e.target.value : 'No Date';
        const prevDate = due_date;
        if(newDate!==prevDate)
            props.editItem(data._id, 'due_date', newDate, prevDate);
    };

    const handleDescrEdit = (e) => {
        toggleDescrEdit(false);
        const newDescr = e.target.value ? e.target.value : 'No Description';
        const prevDescr = description;
        if(newDescr!==prevDescr)
            props.editItem(data._id, 'description', newDescr, prevDescr);
    };

    const handleStatusEdit = (e) => {
        toggleStatusEdit(false);
        const newStatus = e.target.value ? e.target.value : false;
        const prevStatus = status;
        if(newStatus!==prevStatus)
            props.editItem(data._id, 'completed', newStatus, prevStatus);
    };

    const handleAssignEdit = (e) => {
        toggleAssignEdit(false);
        const newAssign = e.target.value ? e.target.value : "No Assign To";
        const prevAssign = assigned_to;
        if(newAssign!==prevAssign)
            props.editItem(data._id, 'assigned_to', newAssign, prevAssign);
    }

    const clickDisabled = () => {}

    return (
        <WRow className='table-entry'>
            <WCol size="3">
                {
                    editingDescr || description === ''
                        ? <WInput
                            className='table-input' onBlur={handleDescrEdit}
                            autoFocus={true} defaultValue={description} type='text'
                            wType="outlined" barAnimation="solid" inputClass="table-input-class"
                        />
                        : <div className="table-text"
                            onClick={() => toggleDescrEdit(!editingDescr)}
                        >{description}
                        </div>
                }
            </WCol>

            <WCol size="2">
                {
                    editingDate ? <input
                        className='table-input' onBlur={handleDateEdit}
                        autoFocus={true} defaultValue={due_date} type='date'
                        wType="outlined" barAnimation="solid" inputClass="table-input-class"
                    />
                        : <div className="table-text"
                            onClick={() => toggleDateEdit(!editingDate)}
                        >{due_date}
                        </div>
                }
            </WCol>

            <WCol size="2">
                {
                    editingStatus ? <select
                        className='table-select' onBlur={handleStatusEdit}
                        autoFocus={true} defaultValue={status}
                    >
                        <option value="complete">complete</option>
                        <option value="incomplete">incomplete</option>
                    </select>
                        : <div onClick={() => toggleStatusEdit(!editingStatus)} className={`${completeStyle} table-text`}>
                            {status}
                        </div>
                }
            </WCol>

            <WCol size="2">
                {
                    editingAssign || assigned_to === ''? 
                    <WInput 
                        className='table-input' onBlur={handleAssignEdit}
                        autoFocus={true} defaultValue={assigned_to} type="text"
                        wType="outlined" barAnimation="solid" inputClass="table-input-class"
                    />
                    :<div className="table-text"
                        onClick={() => toggleAssignEdit(!editingAssign)}
                        style={{color:`${assignedToColor}`}}
                    >
                        {assigned_to}
                    </div>

                    
                }
            </WCol>


            <WCol size="3">
                <div className='button-group'>
                    <WButton className={`${moveupButtonStyle}`} onClick={props.moveupdable ? () => props.reorderItem(data._id, -1) : clickDisabled} wType="texted">
                        <i className="material-icons">expand_less</i>
                    </WButton>
                    <WButton className={`${movedownButtonStyle}`} onClick={props.movedownable ? () => props.reorderItem(data._id, 1) : clickDisabled} wType="texted">
                        <i className="material-icons">expand_more</i>
                    </WButton>
                    <WButton className="table-entry-buttons" onClick={() => props.deleteItem(data)} wType="texted">
                        <i className="material-icons">close</i>
                    </WButton>
                </div>
            </WCol>
        </WRow>
    );
};

export default TableEntry;