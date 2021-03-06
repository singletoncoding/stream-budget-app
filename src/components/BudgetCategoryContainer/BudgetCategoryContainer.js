import React from 'react';
import PropTypes from 'prop-types';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { BudgetTableHead, BudgetItemTableRow } from '../BudgetTable';
import BudgetLineItem from '../../models/BudgetLineItem';
import {
  ModalConsumer,
  AddLineItemModal,
  AreYouSureBudgetLineItemModal,
  AreYouSureBudgetCategoryModal
} from '../Modal';

const styles = theme => ({
  budgetLineItemContainer: {
    width: '100%',
    overflowX: 'auto'
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: 0,
    float: 'left',
    clear: 'left'
  },
  expansionDetails: {
    flexDirection: 'column'
  },
  deleteButton: {
    float: 'right'
  }
});

const headings = ['Name', 'Amount Budgeted', 'Amount Spent', 'Amount Remaining'];

const createCallbackForLineItemProperty = (
  budgetName,
  lineItemName,
  propertyToUpdate,
  updateBudgetCallback,
  isNumberValue = true
) => {
  if (!updateBudgetCallback) {
    return () => {};
  }

  return newPropertyValue => {
    const newValue = isNumberValue ? Number(newPropertyValue.target.value) : newPropertyValue.target.value;

    updateBudgetCallback(budgetName, lineItemName, propertyToUpdate, newValue);
  };
};

const createOnChangeCallbacks = (props, lineItem, modalConsumer) => {
  return {
    onNameChange: createCallbackForLineItemProperty(props.uuid, lineItem.uuid, 'name', props.onBudgetUpdate, false),
    onAmountBudgetedChanged: createCallbackForLineItemProperty(
      props.uuid,
      lineItem.uuid,
      'amountBudgeted',
      props.onBudgetUpdate
    ),
    onAmountSpentChanged: createCallbackForLineItemProperty(
      props.uuid,
      lineItem.uuid,
      'amountSpent',
      props.onBudgetUpdate
    ),
    onDelete: () => {
      modalConsumer.showModal(AreYouSureBudgetLineItemModal, {
        budgetCategoryUUID: props.uuid,
        budgetCategoryLineItemUUID: lineItem.uuid,
        budgetCategoryLineItemName: lineItem.name
      });
    }
  };
};

const generateBudgetItemTableRowEntry = (props, lineItem, modalConsumer) => {
  return (
    <BudgetItemTableRow
      key={lineItem.uuid}
      content={lineItem}
      disableAmountRemaining={true}
      showDelete={true}
      onChangeCallbacks={createOnChangeCallbacks(props, lineItem, modalConsumer)}
    />
  );
};

const generateOnBudgetCategoryDeleteButton = (modalConsumer, props) => {
  return () =>
    modalConsumer.showModal(AreYouSureBudgetCategoryModal, {
      budgetCategoryUUID: props.uuid,
      budgetCategoryName: props.name
    });
};

const BudgetCategoryContainer = props => {
  const { classes } = props;
  return (
    <ModalConsumer>
      {modalConsumer => {
        return (
          <ExpansionPanel>
            <ExpansionPanelSummary>
              <Typography>{props.name}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.expansionDetails}>
              <Paper className={classes.budgetLineItemContainer}>
                <Table className={classes.table}>
                  <BudgetTableHead names={headings} showDelete={true} />
                  <TableBody>
                    {props.budgetLineItems.map(lineItem => {
                      return generateBudgetItemTableRowEntry(props, lineItem, modalConsumer);
                    })}
                  </TableBody>
                </Table>
              </Paper>
              <ExpansionPanelActions>
                <Button
                  size="small"
                  variant="flat"
                  color="primary"
                  className={classes.button}
                  onClick={() =>
                    modalConsumer.showModal(AddLineItemModal, {
                      budgetCategoryUUID: props.uuid
                    })
                  }
                >
                  Add Line Item
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={generateOnBudgetCategoryDeleteButton(modalConsumer, props)}
                >
                  Delete
                </Button>
              </ExpansionPanelActions>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      }}
    </ModalConsumer>
  );
};

BudgetCategoryContainer.defaultProps = {
  named: '',
  uuid: '',
  budgetLineItems: [],
  onBudgetUpdate: () => {}
};

BudgetCategoryContainer.propTypes = {
  name: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
  budgetLineItems: PropTypes.arrayOf(PropTypes.instanceOf(BudgetLineItem)),
  onBudgetUpdate: PropTypes.func
};

export default withStyles(styles)(BudgetCategoryContainer);
