import React from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';

const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const undoButtonStyle = props.undoable ? 'undo-redo' : 'undo-redo-button-disabled';
    const redoButtonStyle = props.redoable ? 'undo-redo' : 'undo-redo-button-disabled';
    const clickDisabled = () => { };
    
    return (
        <WRow className="table-header">
            <WCol size="3">
                <WButton className='table-header-section' wType="texted" onClick={() => props.sortItemsByTask()}>Task</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={() => props.sortItemsByDueDate()}>Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={() => props.sortItemsByStatus()}>Status</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick={() => props.sortItemsByAssignedTo()}>Assign To</WButton>
            </WCol>

            <WCol size="3">
                <div className="table-header-buttons">
                    <WButton className={`${undoButtonStyle}`} onClick={props.undo} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">undo</i>
                    </WButton>
                    <WButton className={`${redoButtonStyle}`} onClick={props.redo} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">redo</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.addItem} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">add_box</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.setShowDelete} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">delete_outline</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : () =>{props.tps.clearAllTransactions(); props.setActiveList({});}} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">close</i>
                    </WButton>
                    
                </div>
            </WCol>

        </WRow>
    );
};

export default TableHeader;