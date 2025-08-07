const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router({ mergeParams: true });

// Update budget for a trip
router.put('/', async (req, res) => {
  const { tripId } = req.params;
  let { total_budget, planned_expenses } = req.body;
  
  // Ensure total_budget is not null
  total_budget = total_budget || 0;
  planned_expenses = planned_expenses || 0;

  try {
    const pool = getPool();
    await pool.query(
      "UPDATE budgets SET total_budget = ?, planned_expenses = ? WHERE trip_id = ?",
      [total_budget, planned_expenses, tripId]
    );
    res.status(200).send({ message: "Budget updated successfully" });
  } catch (err) {
    console.error('Error updating budget:', err);
    res.status(500).send({ message: "Error updating budget" });
  }
});

module.exports = router;