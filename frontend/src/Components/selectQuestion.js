// Global development flag - set to false in production
const DEV = false;


function getMaxValueKey(obj) {
  const maxValue = Math.max(...Object.values(obj));
  const maxKeys = Object.keys(obj).filter(key => obj[key] === maxValue);
  return maxKeys[Math.floor(Math.random() * maxKeys.length)];
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const selectRandomQuestions = (array, count) => {
  shuffleArray(array);
  return array.slice(0, count);
}

class SelectQuestions {
  constructor(mcqs, subjective, examData,COS) {
    this.log = {}; // Contains all the log activity of system
    this.log["error"] = []

    this.selectedQuestions = {};
    this.mcqs = mcqs;
    this.subjective = subjective;
    this.examData = examData;
    this.COS = COS;
    console.log(COS);
    
    // Initialize tracking objects
    this.FinalUnitWiseMarkDistribution = {};
    this.FinalDifficultyWiseMarkDistribution = { 1: 0, 2: 0, 3: 0 };
    this.FinalMarksByCOSDistribution = {}
    this.FinalCOSBySectionDistribution={}

    this.reqMarksByDiff = []
    this.reqQuestionsByMarks = {};
    this.reqMarksByUnits = {...examData.reqMarksByUnits};

    // Initialize data structure
    this.data = this.initializeDataStructure();
    
    // Categorize questions with validation
    this.categorizeQuestions();

    // Initialize unit-wise distribution
    this.examData.includedUnits.forEach(unit => {
      this.FinalUnitWiseMarkDistribution[unit] = 0;
    });

    // Calculate requirements
    this.requiredQuestionByMarks();
    this.requiredMarksByUnit();
    this.requiredQuestionByDifficulty();
    this.createCODistribution();
    

  

    // Then log these initial values instead
    this.log["Initial requirements:"] = {
      "Initialized data structure from which questions are to be selected:" : {...this.initalQuestion},
      "Initial Question By Marks": {...this.reqQuestionsByMarks},
      "Initial Marks per unit": {...this.reqMarksByUnits},
      "Initial Difficulty by marks": [...this.reqMarksByDiff]
    }
    
    
    // Select questions and balance distribution
    this.selectQuestions();
    let done = false
    let loop = 10;
    while(!done && loop > 0){
      done = this.calibrateDifficulty();
      loop -= 1;
    }




    this.log["Final Results:"] = {
      "Final data structure from which questions are selected:" : this.data,
      "Required Question By Marks ": this.reqQuestionsByMarks,
      "Required Marks per unit": this.reqMarksByUnits,
      "Required Difficulty by marks": this.reqMarksByDiff
    }

    if(DEV){
      console.log("EXAM DATA : " , examData);
      console.log("Selected Question" , this.selectedQuestions);
      console.log("CO Data By Section/ Marks" , this.FinalCOSBySectionDistribution);
      console.log("Marks per CO in question Paper" , this.FinalMarksByCOSDistribution);
      this.printAll();
    }
  }

  printAll(){
    for(let key of Object.keys(this.log)){
      console.log(key , this.log[key]);
    }
  }

  initializeDataStructure() {
    const data = {};
    const includedUnits = Array.isArray(this.examData.includedUnits) 
      ? this.examData.includedUnits 
      : [this.examData.includedUnits];
    
    const sections = this.examData.sections || {};

    for (const mark of Object.keys(sections)) {
      data[mark] = {};
      this.selectedQuestions[mark] = [];
      
      for (const unit of includedUnits) {
        data[mark][unit] = { 1: [], 2: [], 3: [] };
      }
    }
    
    return data;
  }

  categorizeQuestions() {
    for (const q of this.subjective) {
      try {
        if (!this.data[q.Marks] || !this.data[q.Marks][q.Unit]) continue;
        
        // Validate and normalize difficulty level
        let level = parseInt(q.Level);
        if (isNaN(level)) level = 2; // Default to medium
        level = Math.max(1, Math.min(3, level));
        
        this.data[q.Marks][q.Unit][level].push(q);
      } catch (error) {
        if (DEV) console.warn(`Failed to categorize question:`, q, error);
      }
    }
    this.initalQuestion = structuredClone(this.data);
  }

  requiredQuestionByDifficulty() {
    const level = this.examData.difficultyLevel;
    
    // Ensure minimum allocation for each difficulty
    const minAllocation = Math.max(1, Math.floor(this.total_marks * 0.05));
    let e = Math.max(minAllocation, Math.floor(level.easy * this.total_marks / 100));
    let n = Math.max(minAllocation, Math.floor(level.normal * this.total_marks / 100));
    let h = Math.max(0, this.total_marks - e - n);
    // Adjust if hard becomes negative
    if (h < 0) {
      h = 0;
      const total = e + n;
      e = Math.floor((e / total) * this.total_marks);
      n = this.total_marks - e;
    }
    
    this.reqMarksByDiff = [0, e, n, h];
    this.initalRequiredDifficulty = [0, e, n, h];
  }

  createCODistribution(){
    const data = {};
    Object.keys(this.COS).map((key)=>(
      data[key] = 0
    ))

    this.FinalMarksByCOSDistribution = {...data};

    Object.keys(this.data).map((key)=>(
      this.FinalCOSBySectionDistribution[key] = {...data}
    ))

    
  }

  calibrateQueByDifficulty() {
    for (let i = 1; i <= 3; i++) {
      if (this.reqMarksByDiff[i] >= 0) continue;
      
      let j = 1;
      while (this.reqMarksByDiff[i] < 0 && j <= 3) {
        if (j === i || this.reqMarksByDiff[j] <= 0) {
          j++;
          continue;
        }
        
        const transfer = Math.min(-this.reqMarksByDiff[i], this.reqMarksByDiff[j]);
        this.reqMarksByDiff[i] += transfer;
        this.reqMarksByDiff[j] -= transfer;
      }
    }
  }

  requiredQuestionByMarks() {
    
    for (const mark of Object.keys(this.examData.sections)) {
      this.reqQuestionsByMarks[mark] = this.examData.sections[mark].inputQuestions;
      // this.FinalCOSBySectionDistribution[mark] = [];
    }
  }

  requiredMarksByUnit() {
    
    this.includedUnits = Array.isArray(this.examData.includedUnits)
      ? this.examData.includedUnits
      : [this.examData.includedUnits];
    this.totalUnits = this.includedUnits.length;
    this.total_marks = 0;

    for (const mark of Object.keys(this.examData.sections)) {
      this.total_marks += parseInt(mark) * parseInt(this.examData.sections[mark].inputQuestions);
    }

  }

  calibrateMarksByUnits() {
    for (const unit in this.reqMarksByUnits) {
      if (this.reqMarksByUnits[unit] >= 0) continue;

      for (const otherUnit in this.reqMarksByUnits) {
        if (otherUnit === unit || this.reqMarksByUnits[otherUnit] <= 0) continue;

        const transfer = Math.min(-this.reqMarksByUnits[unit], this.reqMarksByUnits[otherUnit]);
        this.reqMarksByUnits[unit] += transfer;
        this.reqMarksByUnits[otherUnit] -= transfer;

        if (this.reqMarksByUnits[unit] >= 0) break;
      }
    }
  }

  selectQueByDifficulty(que , index) {
    let unit = getMaxValueKey(this.reqMarksByUnits);
    if (!unit){
      this.log["error"].push("Error While getting unit for a question");
      AlertCircle("Problem in Marks By Unit Data")
      return;
    };


    // Ensure unit has questions
    while (unit && Object.values(que[unit]).every(arr => arr.length === 0)) {
      delete this.reqMarksByUnits[unit];
      unit = getMaxValueKey(this.reqMarksByUnits);
    }

    
    const logData = {};
    logData["Selected Unit"] = unit;

    // Determine priority order based on remaining requirements ( decending order of required Difficulty)
    const priority = [1, 2, 3]
      .filter(level => this.reqMarksByDiff[level] > 0)
      .sort((a, b) => this.reqMarksByDiff[b] - this.reqMarksByDiff[a]);

    logData["Difficulty Priority"] = priority;

    let q = null;
    let selectedLevel = 1;

    // Try to find a question in priority order
    for (const level of priority) {
      if (que[unit][level].length > 0) {
        const index = Math.floor(Math.random() * que[unit][level].length);
        q = que[unit][level][index];
        selectedLevel = level;
        logData["Selected Level"] = level;
        break;
      }
    }
    
    

    // If no priority question found, select any available
    if (!q) {
      for (let level = 3; level >= 1; level--) {
        if (que[unit][level].length > 0) {
          const index = Math.floor(Math.random() * que[unit][level].length);
          q = que[unit][level][index];
          selectedLevel = level;
          logData["Random Level is selected"] = level;
          break;
        }
      }
    }
    logData["Selected Question"] = q;
    

    if (!q) return;

    // Update all tracking
    this.selectedQuestions[q.Marks].push(q);
    
    this.data[q.Marks][unit][selectedLevel] = 
      this.data[q.Marks][unit][selectedLevel].filter(item => item !== q);

    this.FinalCOSBySectionDistribution[q.Marks][q.CO] += 1;
    this.FinalMarksByCOSDistribution[q.CO] += q.Marks;

    this.reqMarksByUnits[unit] -= q.Marks;
    this.reqMarksByDiff[selectedLevel] -= q.Marks;
    this.FinalUnitWiseMarkDistribution[unit] += q.Marks;
    this.FinalDifficultyWiseMarkDistribution[selectedLevel] += q.Marks;
    
    
    // this.FinalCOSBySectionDistribution[q.Marks] += 

    this.calibrateQueByDifficulty();
    this.calibrateMarksByUnits();
    logData["Remaining Marks by Difficulty"] =  {...this.reqMarksByDiff};
    logData["Remaining Marks by Units"] = {...this.reqMarksByUnits};
    this.log["ques Selection Process"].push(logData);
  }

  allocationBySection(marks) {
    return new Promise((resolve) => {
      // Process all questions synchronously first
      for (let i = 0; i < this.reqQuestionsByMarks[marks]; i++) {
        this.selectQueByDifficulty(this.data[marks], i);
      }
      // Resolve with the current state
      resolve({
        selectedQuestions: [...this.selectedQuestions[marks]],
        remainingUnits: {...this.reqMarksByUnits},
        remainingDifficulty: {...this.reqMarksByDiff}
      });
    });
  }

  balanceDifficultyDistribution() {
    const difficulties = [1, 2, 3];
    
    // Check for any difficulty with zero allocation
    const zeroDiff = difficulties.filter(d => this.FinalDifficultyWiseMarkDistribution[d] === 0);
    
    zeroDiff.forEach(targetDiff => {
      // Try to find a question of this difficulty to promote
      for (const mark in this.selectedQuestions) {
        const replaceIndex = this.selectedQuestions[mark].findIndex(
          q => q.Level !== targetDiff && this.FinalDifficultyWiseMarkDistribution[q.Level] > q.Marks
        );
        
        if (replaceIndex !== -1) {
          const toReplace = this.selectedQuestions[mark][replaceIndex];
          
          // Find a replacement question
          for (const unit in this.data[mark]) {
            if (this.data[mark][unit][targetDiff].length > 0) {
              const replacement = this.data[mark][unit][targetDiff][0];
              
              // Swap the questions
              this.selectedQuestions[mark][replaceIndex] = replacement;
              this.data[mark][unit][targetDiff].shift();
              this.data[mark][unit][toReplace.Level].push(toReplace);
              
              // Update tracking
              this.FinalDifficultyWiseMarkDistribution[targetDiff] += replacement.Marks;
              this.FinalDifficultyWiseMarkDistribution[toReplace.Level] -= toReplace.Marks;
              break;
            }
          }
        }
      }
    });
  }

  async selectQuestions() {
    
    const sortedMarks = Object.keys(this.reqQuestionsByMarks)
      .map(Number)
      .sort((a, b) => b - a);
    
    this.log["Selection Started :"] =  sortedMarks;
    this.log["ques Selection Process"] = [];

    try {
      for (const marks of sortedMarks) {
        this.log["ques Selection Process"].push(`Selection process for marks ${marks} section`);
        await this.allocationBySection(marks)
          .then(result => {
            this.log[`After ${marks} mark questions:`] = {
              "selected Questions": result.selectedQuestions,
              "remaining required marks per unit": result.remainingUnits,
              "remaining required marks by difficulty": result.remainingDifficulty
            }
          });
      }
    } catch (err) {
      if (DEV) console.error("Error selecting questions:", err);
      throw err;
    }
  }

  calibrateDifficulty() {
    const tolerance = 0.2; // 20% tolerance for difficulty distribution
    const initialDifficulty = this.initalRequiredDifficulty.slice(1); // [easy, medium, hard]
  
    // Helper to calculate the difference percentage
    const getDiffPercent = (current, target) => Math.abs(current - target) / target;
  
    // Check if the current difficulty distribution is within tolerance
    const isWithinTolerance = (current, target) => {
      return getDiffPercent(current, target) <= tolerance;
    };
  
    // If the difficulty distribution is within tolerance, no need to adjust
    if (
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[1], initialDifficulty[0]) &&
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[2], initialDifficulty[1]) &&
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[3], initialDifficulty[2])
    ) {
      return true; // No calibration needed
    }
  
    // Calibrate the difficulty distribution
    const difficultyLevels = [1, 2, 3];
  
    for (let i = 0; i < difficultyLevels.length; i++) {
      const level = difficultyLevels[i];
      const requiredMarks = initialDifficulty[i];
      const currentMarks = this.FinalDifficultyWiseMarkDistribution[level];
  
      // If current marks exceed required, try swapping with other difficulties
      if (currentMarks > requiredMarks) {
        const excessMarks = currentMarks - requiredMarks;
        this.adjustDifficulty(level, -excessMarks);
      }
      // If current marks are less than required, try to promote questions
      else if (currentMarks < requiredMarks) {
        const deficitMarks = requiredMarks - currentMarks;
        this.adjustDifficulty(level, deficitMarks);
      }
    }

    if (
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[1], initialDifficulty[0]) &&
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[2], initialDifficulty[1]) &&
      isWithinTolerance(this.FinalDifficultyWiseMarkDistribution[3], initialDifficulty[2])
    ) {
      return true; // No calibration needed
    }
    else{
      return false;
    }
  }
  
  adjustDifficulty(level, marksToAdjust) {
    const oppositeLevels = [1, 2, 3].filter(l => l !== level);
    
    for (const oppLevel of oppositeLevels) {
      const availableQuestions = this.selectedQuestions[Object.keys(this.selectedQuestions)[0]]; // Just to get the first section
  
      // Find questions that can be swapped
      const candidates = availableQuestions.filter(q => q.Level === oppLevel && q.Marks <= marksToAdjust);
      if (candidates.length === 0) continue;
  
      for (const candidate of candidates) {
        if (marksToAdjust <= 0) break;
  
        // Swap the question
        const index = availableQuestions.indexOf(candidate);
        const replacement = this.getReplacementQuestion(level, candidate.Marks);
  
        if (replacement) {
          // Swap in the selected questions
          availableQuestions[index] = replacement;
  
          // Update difficulty distribution
          this.FinalDifficultyWiseMarkDistribution[oppLevel] -= candidate.Marks;
          this.FinalDifficultyWiseMarkDistribution[level] += replacement.Marks;
  
          // Adjust the marks to reflect the swap
          marksToAdjust -= candidate.Marks;
        }
      }
    }
  }
  
  getReplacementQuestion(level, marks) {
    for (const mark in this.data) {
      for (const unit in this.data[mark]) {
        const questions = this.data[mark][unit][level];
        if (questions.length > 0) {
          return questions.shift(); // Return the first available question
        }
      }
    }
    return null; // No replacement found
  }
  


  
  getSelectedQuestions() {
    return {
      selectedQuestions: this.selectedQuestions,
      unitDistribution: this.FinalUnitWiseMarkDistribution,
      difficultyDistribution: this.FinalDifficultyWiseMarkDistribution,
      CObySection : this.FinalCOSBySectionDistribution,
      MarksbyCO : this.FinalMarksByCOSDistribution,
    };
  }
}

export { SelectQuestions};