class SmartQuestionSelector {
  constructor(mcqs, subjective, examData) {
    this.mcqs = mcqs;
    this.subjective = subjective;
    this.examData = examData;
    
    // Initialize tracking objects
    this.FinalUnitWiseMarkDistribution = {};
    this.FinalDifficultyWiseMarkDistribution = { 1: 0, 2: 0, 3: 0 };
    this.selectedQuestions = {};
    
    // Initialize
    this.prepareDataStructures();
    this.selectQuestions();
  }

  prepareDataStructures() {
    // Initialize unit distribution tracking
    this.examData.includedUnits.forEach(unit => {
      this.FinalUnitWiseMarkDistribution[unit] = 0;
    });

    // Initialize selected questions structure
    Object.keys(this.examData.sections).forEach(mark => {
      this.selectedQuestions[mark] = [];
    });

    // Organize questions into accessible structure
    this.questionPool = {};
    Object.keys(this.examData.sections).forEach(mark => {
      this.questionPool[mark] = { byUnit: {}, byDifficulty: { 1: [], 2: [], 3: [] } };
      
      this.examData.includedUnits.forEach(unit => {
        this.questionPool[mark].byUnit[unit] = { 1: [], 2: [], 3: [] };
      });
    });

    // Categorize questions
    this.subjective.forEach(q => {
      if (this.questionPool[q.Marks] && this.questionPool[q.Marks].byUnit[q.Unit]) {
        const level = Math.max(1, Math.min(3, q.Level || 2));
        this.questionPool[q.Marks].byUnit[q.Unit][level].push(q);
        this.questionPool[q.Marks].byDifficulty[level].push(q);
      }
    });
  }

  // NEW: Helper method to remove question from pool
  removeQuestionFromPool(question, mark, unit) {
    const level = question.Level;
    
    // Remove from byUnit structure
    const unitPool = this.questionPool[mark].byUnit[unit][level];
    const unitIndex = unitPool.findIndex(q => q === question);
    if (unitIndex !== -1) {
      unitPool.splice(unitIndex, 1);
    }
    
    // Remove from byDifficulty structure
    const diffPool = this.questionPool[mark].byDifficulty[level];
    const diffIndex = diffPool.findIndex(q => q === question);
    if (diffIndex !== -1) {
      diffPool.splice(diffIndex, 1);
    }
  }

  // NEW: Helper method to return question to pool
  returnQuestionToPool(question, mark) {
    const level = question.Level;
    const unit = question.Unit;
    
    if (!this.questionPool[mark] || !this.questionPool[mark].byUnit[unit]) {
      return; // Invalid pool reference
    }
    
    this.questionPool[mark].byUnit[unit][level].push(question);
    this.questionPool[mark].byDifficulty[level].push(question);
  }

  selectQuestions() {
    // Calculate requirements
    const totalMarks = this.calculateTotalMarks();
    const unitMarksTarget = Math.floor(totalMarks / this.examData.includedUnits.length);
    const difficultyTargets = this.calculateDifficultyTargets(totalMarks);

    // Phase 1: Primary selection by unit distribution
    this.selectByUnits(unitMarksTarget);

    // Phase 2: Balance difficulty distribution
    this.balanceDifficulties(difficultyTargets);

    // Phase 3: Final adjustment to meet exact counts
    this.meetExactRequirements();
  }

  calculateTotalMarks() {
    return Object.entries(this.examData.sections).reduce((sum, [mark, section]) => {
      return sum + (parseInt(mark) * parseInt(section.inputQuestions));
    }, 0);
  }

  calculateDifficultyTargets(totalMarks) {
    const { easy, normal } = this.examData.difficultyLevel;
    return {
      1: Math.max(1, Math.floor(totalMarks * easy / 100)),   // Easy
      2: Math.max(1, Math.floor(totalMarks * normal / 100)), // Medium
      3: Math.max(1, totalMarks - Math.floor(totalMarks * easy / 100) - 
                     Math.floor(totalMarks * normal / 100))   // Hard
    };
  }

  selectByUnits(unitMarksTarget) {
    const marks = Object.keys(this.examData.sections).sort((a, b) => b - a); // High marks first
    
    marks.forEach(mark => {
      const targetCount = this.examData.sections[mark].inputQuestions;
      let selectedCount = 0;
      
      while (selectedCount < targetCount) {
        // Find unit with largest remaining requirement
        const unit = this.getMostNeedyUnit(unitMarksTarget, mark);
        if (!unit) break; // No suitable unit found
        
        // Find suitable question
        const question = this.findQuestionForUnit(unit, mark, unitMarksTarget);
        if (!question) break;
        
        // Add to selection
        this.selectedQuestions[mark].push(question);
        this.FinalUnitWiseMarkDistribution[unit] += parseInt(mark);
        this.FinalDifficultyWiseMarkDistribution[question.Level] += parseInt(mark);
        selectedCount++;
        
        // Remove from pool
        this.removeQuestionFromPool(question, mark, unit);
      }
    });
  }

  getMostNeedyUnit(unitMarksTarget, mark) {
    return Object.keys(this.FinalUnitWiseMarkDistribution)
      .filter(unit => this.FinalUnitWiseMarkDistribution[unit] < unitMarksTarget * 1.05) // 5% tolerance
      .sort((a, b) => this.FinalUnitWiseMarkDistribution[a] - this.FinalUnitWiseMarkDistribution[b])[0];
  }

  findQuestionForUnit(unit, mark, unitMarksTarget) {
    // Try to find a question that helps balance both unit and difficulty
    const remainingByUnit = unitMarksTarget - this.FinalUnitWiseMarkDistribution[unit];
    
    // First try to find a question that fits remaining unit needs exactly
    for (let level = 1; level <= 3; level++) {
      const available = this.questionPool[mark]?.byUnit[unit]?.[level] || [];
      if (available.length > 0) {
        return available[0]; // Return first available (will be randomized in practice)
      }
    }
    
    // If no perfect fit, return any available question for this unit
    for (let level = 1; level <= 3; level++) {
      const available = this.questionPool[mark]?.byUnit[unit]?.[level] || [];
      if (available.length > 0) {
        return available[0];
      }
    }
    
    return null;
  }

  balanceDifficulties(targets) {
    const marks = Object.keys(this.selectedQuestions);
    
    // Calculate current deviations
    const deviations = {
      1: (this.FinalDifficultyWiseMarkDistribution[1] - targets[1]) / targets[1],
      2: (this.FinalDifficultyWiseMarkDistribution[2] - targets[2]) / targets[2],
      3: (this.FinalDifficultyWiseMarkDistribution[3] - targets[3]) / targets[3]
    };

    // While any deviation exceeds 5%
    while (Math.max(...Object.values(deviations).map(Math.abs)) > 0.05) {
      // Find most over-represented and under-represented levels
      const sortedLevels = [1, 2, 3].sort((a, b) => deviations[a] - deviations[b]);
      const underRep = sortedLevels[0];
      const overRep = sortedLevels[2];
      
      // Try to find a swap opportunity
      if (!this.adjustDifficultyBalance(underRep, overRep)) {
        break; // Can't improve further
      }
      
      // Recalculate deviations
      for (const level of [1, 2, 3]) {
        deviations[level] = (this.FinalDifficultyWiseMarkDistribution[level] - targets[level]) / targets[level];
      }
    }
  }

  adjustDifficultyBalance(underRep, overRep) {
    const marks = Object.keys(this.selectedQuestions).sort((a, b) => b - a);
    
    for (const mark of marks) {
      // Try to find an over-represented question to replace
      for (let i = 0; i < this.selectedQuestions[mark].length; i++) {
        const q = this.selectedQuestions[mark][i];
        if (q.Level === overRep) {
          // Try to find a replacement with under-represented level
          const replacement = this.findReplacementQuestion(mark, q.Unit, underRep);
          if (replacement) {
            // Perform swap
            this.selectedQuestions[mark][i] = replacement;
            this.FinalDifficultyWiseMarkDistribution[overRep] -= parseInt(mark);
            this.FinalDifficultyWiseMarkDistribution[underRep] += parseInt(mark);
            
            // Return old question to pool and remove new one
            this.returnQuestionToPool(q, mark);
            this.removeQuestionFromPool(replacement, mark, replacement.Unit);
            return true;
          }
        }
      }
    }
    return false;
  }

  // NEW: Helper to find replacement question
  findReplacementQuestion(mark, unit, targetLevel) {
    // First try same unit
    if (this.questionPool[mark]?.byUnit[unit]?.[targetLevel]?.length > 0) {
      return this.questionPool[mark].byUnit[unit][targetLevel][0];
    }
    
    // Then try any unit
    for (const u in this.questionPool[mark]?.byUnit || {}) {
      if (this.questionPool[mark].byUnit[u][targetLevel]?.length > 0) {
        return this.questionPool[mark].byUnit[u][targetLevel][0];
      }
    }
    
    return null;
  }

  meetExactRequirements() {
    // Ensure exact question counts per section
    Object.entries(this.examData.sections).forEach(([mark, section]) => {
      const currentCount = this.selectedQuestions[mark].length;
      const targetCount = section.inputQuestions;
      
      if (currentCount < targetCount) {
        this.addAdditionalQuestions(mark, targetCount - currentCount);
      } else if (currentCount > targetCount) {
        this.removeExcessQuestions(mark, currentCount - targetCount);
      }
    });
  }

  // NEW: Helper to add more questions when needed
  addAdditionalQuestions(mark, count) {
    let added = 0;
    while (added < count) {
      // Find any available question
      for (let level = 1; level <= 3; level++) {
        if (this.questionPool[mark]?.byDifficulty[level]?.length > 0) {
          const question = this.questionPool[mark].byDifficulty[level][0];
          this.selectedQuestions[mark].push(question);
          this.FinalUnitWiseMarkDistribution[question.Unit] += parseInt(mark);
          this.FinalDifficultyWiseMarkDistribution[level] += parseInt(mark);
          this.removeQuestionFromPool(question, mark, question.Unit);
          added++;
          break;
        }
      }
      
      // If no questions found at all, break
      if (this.questionPool[mark]?.byDifficulty[1]?.length === 0 &&
          this.questionPool[mark]?.byDifficulty[2]?.length === 0 &&
          this.questionPool[mark]?.byDifficulty[3]?.length === 0) {
        break;
      }
    }
  }

  // NEW: Helper to remove excess questions
  removeExcessQuestions(mark, count) {
    let removed = 0;
    while (removed < count && this.selectedQuestions[mark].length > 0) {
      const question = this.selectedQuestions[mark].pop();
      this.FinalUnitWiseMarkDistribution[question.Unit] -= parseInt(mark);
      this.FinalDifficultyWiseMarkDistribution[question.Level] -= parseInt(mark);
      this.returnQuestionToPool(question, mark);
      removed++;
    }
  }

  getSelectedQuestions() {
    return {
      selectedQuestions: this.selectedQuestions,
      unitDistribution: this.FinalUnitWiseMarkDistribution,
      difficultyDistribution: this.FinalDifficultyWiseMarkDistribution
    };
  }
}

export {SmartQuestionSelector}