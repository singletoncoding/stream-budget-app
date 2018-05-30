import React from 'react';
import BudgetLineItem from '../../models/BudgetLineItem';
import BudgetCategory from '../../models/BudgetCategory';
import Summary from '../../models/Summary';
import Budget from '../../models/Budget';
import uuid from 'uuid/v4';

import mockData from './mock-data.js';

const BudgetContext = React.createContext();
const BudgetConsumer = BudgetContext.Consumer;

class BudgetProvider extends React.Component {
  state = {
    budgets: mockData.budgets,
    currentlySelectedBudget: mockData.currentlySelectedBudget
  };

  getBudgetsList = () => {
    return this.state.budgets.map(budget => ({
      name: budget.name,
      uuid: budget.uuid,
      isCurrentlySelectedBudget: budget.uuid === this.state.currentlySelectedBudget
    }));
  };

  deleteBudgetLineItem = (budgetName, budgetLineItemName) => {
    this.setState(previousState => {
      const copiedBudgets = this.copyBudgetsFromState(previousState);
      const currentlySelectedBudget = this.getCurrentlySelectedBudget(copiedBudgets);
      const matchingBudgetCategory = currentlySelectedBudget.budgetCategories.find(budget => budget.name === budgetName);

      matchingBudgetCategory.budgetLineItems =  matchingBudgetCategory.budgetLineItems.filter(budgetLineItem => budgetLineItem.name !== budgetLineItemName);
      return {
        budgets: copiedBudgets
      }
    });
  };

  addNewBudgetLineItem = (budgetCategoryName, budgetLineItemName) => {
    this.setState(previousState => {
      const copiedBudgets = this.copyBudgetsFromState(previousState);
      const currentlySelectedBudget = this.getCurrentlySelectedBudget(copiedBudgets);
      const matchingBudgetCategory = currentlySelectedBudget.budgetCategories.find(budgetCategory => budgetCategory.name === budgetCategoryName);

      matchingBudgetCategory.budgetLineItems.push(
        new BudgetLineItem({
          uuid: uuid(),
          name: budgetLineItemName,
          amountBudgeted: 0,
          amountSpent: 0
        })
      );

      return {
        budgets: copiedBudgets
      };
    });
  };

  addNewBudget = budgetName => {
    this.setState(previousState => {
      const copiedBudgets = this.copyBudgetsFromState(previousState);
      const newBudget = new Budget({
        uuid: uuid(),
        name: budgetName,
        budgetCategories: []
      });

      return {
        budgets: [newBudget, ...copiedBudgets],
        currentlySelectedBudget: newBudget.uuid
      };
    })
  };

  addNewBudgetCategory = budgetCategoryName => {
    this.setState(previousState => {
      const copiedBudgets = this.copyBudgetsFromState(previousState);
      const currentlySelectedBudget = this.getCurrentlySelectedBudget(copiedBudgets);
      currentlySelectedBudget.budgetCategories.push(
        new BudgetCategory({
          name: budgetCategoryName,
          uuid: uuid(),
          budgetLineItems: []
        })
      );

      return {
        budgets: copiedBudgets
      };
    });
  };

  copyBudgetsFromState = previousState => {
    const { budgets } = previousState;
    return budgets.map(budget => budget.copy());
  };

  getCurrentlySelectedBudget = (budgets) => {
    return budgets.find(budget => budget.uuid === this.state.currentlySelectedBudget);
  };

  updateCurrentlySelectedBudget = (uuid) => {
    this.setState({
      currentlySelectedBudget: uuid
    })
  };

  updateBudget = (budgetCategoryName, lineItemName, propertyToUpdate, propertyNewValue) => {
    this.setState(previousState => {
      const copiedBudgets = this.copyBudgetsFromState(previousState);
      const currentlySelectedBudget = this.getCurrentlySelectedBudget(copiedBudgets);

      const matchingBudgetCategory = currentlySelectedBudget.budgetCategories.find(budget => budget.name === budgetCategoryName);
      const budgetLineItem = matchingBudgetCategory.budgetLineItems.find(lineItem => lineItem.name === lineItemName);

      const budgetLineItemIndex = matchingBudgetCategory.budgetLineItems.indexOf(budgetLineItem);

      matchingBudgetCategory.budgetLineItems[budgetLineItemIndex] = new BudgetLineItem({
        ...budgetLineItem,
        [propertyToUpdate]: propertyNewValue
      });

      budgetLineItem[propertyToUpdate] = propertyNewValue;
      return {
        budgets: copiedBudgets
      };
    });
  };

  calculateSummariesWithTotal= () => {
    const summaries = this.calculateSummaries();
    const totalSummary  = summaries.reduce((accumulator, currentValue) => {
      return {
        budgeted: currentValue.amountBudgeted + accumulator.budgeted,
        spent: currentValue.amountSpent + accumulator.spent
      }
    }, {budgeted: 0 , spent: 0});

    summaries.push(new Summary({
      name: 'Total',
      amountBudgeted: totalSummary.budgeted,
      amountSpent: totalSummary.spent
    }));
    return summaries;
  };

  calculateSummaries = () => {
    const budgetCategories = this.getBudgetCategoriesForCurrentBudget();
    return budgetCategories.map(singleBudget => {
      const summaryStructure = singleBudget.budgetLineItems.reduce(
        (accumulator, currentValue) => {
          return {
            budgeted: accumulator.budgeted + currentValue.amountBudgeted,
            spent: accumulator.spent + currentValue.amountSpent
          };
        },
        { budgeted: 0, spent: 0 }
      );

      return new Summary({
        name: singleBudget.name,
        amountBudgeted: summaryStructure.budgeted,
        amountSpent: summaryStructure.spent
      });
    });
  };

  getBudgetCategoriesForCurrentBudget = () => {
    return this.state.budgets.find(budget => budget.uuid === this.state.currentlySelectedBudget).budgetCategories;
  };

  render() {
    return (
      <BudgetContext.Provider
        value={{
          getBudgetsList: this.getBudgetsList,
          getBudgetCategoriesForCurrentBudget: this.getBudgetCategoriesForCurrentBudget,
          getSummary: this.calculateSummaries,
          getSummaryWithTotal: this.calculateSummariesWithTotal,
          updateCurrentlySelectedBudget: this.updateCurrentlySelectedBudget,
          updateBudget: this.updateBudget,
          addNewBudgetCategory: this.addNewBudgetCategory,
          addNewBudgetLineItem: this.addNewBudgetLineItem,
          addNewBudget: this.addNewBudget,
          deleteBudgetLineItem: this.deleteBudgetLineItem
        }}
      >
        {this.props.children}
      </BudgetContext.Provider>
    );
  }
}

export {
  BudgetProvider,
  BudgetConsumer
};