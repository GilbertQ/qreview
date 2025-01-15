import React, { useState } from 'react';
import { Button, Typography, Checkbox, FormControlLabel, FormControl, Box } from '@mui/material';

const QuizComponent = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsReviewed, setQuestionsReviewed] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [wronglyAnsweredQuestions, setWronglyAnsweredQuestions] = useState([]);
  const [revisitedQuestionsReviewed, setRevisitedQuestionsReviewed] = useState(0);
  const [revisitedCorrectAnswers, setRevisitedCorrectAnswers] = useState(0);
  const [isRevisitingWrongAnswers, setIsRevisitingWrongAnswers] = useState(false);
  const [revisitCycleCount, setRevisitCycleCount] = useState(0);
  const [wrongAnswersReviewList, setWrongAnswersReviewList] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewCycleCount, setReviewCycleCount] = useState(0);
  const [correctlyAnsweredInReview, setCorrectlyAnsweredInReview] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setQuizData(data);
      setUsedQuestions([]);
      setWronglyAnsweredQuestions([]);
      setIsRevisitingWrongAnswers(false);
      setRevisitCycleCount(0);
      selectRandomQuestion(data);
    };
    reader.readAsText(file);
  };

  const selectRandomQuestion = (data) => {
    let availableQuestions = isRevisitingWrongAnswers ? wronglyAnsweredQuestions : data;
    
    const unusedQuestions = availableQuestions.filter((_, index) => !usedQuestions.includes(index));

    if (unusedQuestions.length === 0) {
      if (isRevisitingWrongAnswers) {
        const revisitPercentage = ((revisitedCorrectAnswers / revisitedQuestionsReviewed) * 100).toFixed(2);
        
        if (revisitPercentage < 100 && revisitCycleCount < 2) {
          setRevisitedQuestionsReviewed(0);
          setRevisitedCorrectAnswers(0);
          setUsedQuestions([]);
          setRevisitCycleCount(revisitCycleCount + 1);
        } else {
          setIsRevisitingWrongAnswers(false);
          setWronglyAnsweredQuestions([]);
          setRevisitCycleCount(0);
        }
        return;
      } else {
        setUsedQuestions([]);
      }
      selectRandomQuestion(availableQuestions);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const selectedQuestion = unusedQuestions[randomIndex];
    const originalIndex = data.indexOf(selectedQuestion);

    setCurrentQuestion(selectedQuestion);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setUsedQuestions([...usedQuestions, originalIndex]);
  };

  const handleAnswerChange = (event) => {
    const answer = event.target.value;
    setSelectedAnswers(prevSelectedAnswers =>
      prevSelectedAnswers.includes(answer)
        ? prevSelectedAnswers.filter(ans => ans !== answer)
        : [...prevSelectedAnswers, answer]
    );
  };

  if (!quizData) {
    return (
      <Box>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </Box>
    );
  }

  const questionText = currentQuestion.slice(0, currentQuestion.findIndex(line => line.startsWith("A."))).join(' ');

  const answerOptions = [];
  let currentAnswer = '';

  for (let i = 0; i < currentQuestion.length; i++) {
    const line = currentQuestion[i];
    if (/^[A-F]\./.test(line)) {
      if (currentAnswer) {
        answerOptions.push(currentAnswer.trim());
      }
      currentAnswer = line;
    } else if (/^Answer/.test(line)) {
      if (currentAnswer) {
        answerOptions.push(currentAnswer.trim());
      }
      break;
    } else if (currentAnswer) {
      currentAnswer += ' ' + line;
    }
  }

  const explanationIndex = currentQuestion.findIndex(line => line.startsWith("Answer"));
  const explanationText = '\n' + currentQuestion.slice(explanationIndex).join(' ')
    .replace('Explanation', '\n\nExplanation:\n\n')+ '\n';

  const percentageCorrect = isRevisitingWrongAnswers
    ? revisitedQuestionsReviewed > 0
      ? ((revisitedCorrectAnswers / revisitedQuestionsReviewed) * 100).toFixed(2)
      : 0
    : questionsReviewed > 0
      ? ((correctAnswers / questionsReviewed) * 100).toFixed(2)
      : 0;

      const selectNextQuestion = () => {
        if (isRevisitingWrongAnswers) {
          if (currentReviewIndex < wrongAnswersReviewList.length - 1) {
            setCurrentReviewIndex(currentReviewIndex + 1);
            setCurrentQuestion(wrongAnswersReviewList[currentReviewIndex + 1]);
          } else {
            // End of review cycle
            const allCorrect = Object.values(correctlyAnsweredInReview).every(v => v);
            if (allCorrect || reviewCycleCount >= 2) {
              // End review mode
              setIsRevisitingWrongAnswers(false);
              setWronglyAnsweredQuestions([]);
              setReviewCycleCount(0);
              setCurrentReviewIndex(0);
              setCorrectlyAnsweredInReview({});
            } else {
              // Start next review cycle
              setReviewCycleCount(reviewCycleCount + 1);
              setCurrentReviewIndex(0);
              setCurrentQuestion(wrongAnswersReviewList[0]);
              setCorrectlyAnsweredInReview({});
            }
          }
        } else {
          selectRandomQuestion(quizData);
        }
      };
    
      const handleConfirm = () => {
        setShowExplanation(true);
    
        const correctAnswerLine = currentQuestion.find(line => line.startsWith("Answer"));
        const correctAnswersList = correctAnswerLine
          .replace("Answer:", "")
          .replace(".", "")
          .split(",")
          .map(ans => ans.trim());
    
        const selectedAnswerChars = selectedAnswers.map(answer => answer.charAt(0));
    
        const allCorrect = correctAnswersList.length === selectedAnswerChars.length &&
          correctAnswersList.every(ans => selectedAnswerChars.includes(ans));
    
        if (isRevisitingWrongAnswers) {
          setCorrectlyAnsweredInReview({
            ...correctlyAnsweredInReview,
            [currentReviewIndex]: allCorrect
          });
        } else {
          setQuestionsReviewed(questionsReviewed + 1);
          if (allCorrect) {
            setCorrectAnswers(correctAnswers + 1);
          } else {
            setWronglyAnsweredQuestions(prev => [...prev, currentQuestion]);
          }
        }
    
        // Check if we should enter review mode
        if (!isRevisitingWrongAnswers && 
            ((correctAnswers + (allCorrect ? 1 : 0)) / (questionsReviewed + 1)) * 100 < 80 && 
            wronglyAnsweredQuestions.length + (allCorrect ? 0 : 1) > 5) {
          setIsRevisitingWrongAnswers(true);
          setWrongAnswersReviewList([...wronglyAnsweredQuestions, ...(allCorrect ? [] : [currentQuestion])]);
          setCurrentReviewIndex(0);
          setReviewCycleCount(0);
          setCorrectlyAnsweredInReview({});
        }
      };
    
      const handleContinue = () => {
        selectNextQuestion();
      };    

  return (
    <Box>
      <Typography variant="h6">{questionText}</Typography>
      <FormControl component="fieldset">
        {answerOptions.map((option, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={selectedAnswers.includes(option)}
                onChange={handleAnswerChange}
                value={option}
                disabled={showExplanation}
              />
            }
            label={option}
          />
        ))}
      </FormControl>
      {!showExplanation ? (
        <Button variant="contained" color="success" onClick={handleConfirm}>Confirm</Button>
      ) : (
        <>
        <Button variant="contained" onClick={handleContinue}>Continue</Button>
          <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>
  {explanationText}
</Typography>
          
        </>
      )}

      <Box mt={4} display="flex" justifyContent="space-between" width="100%">
        <Typography variant="body1">Questions: {quizData ? quizData.length : 0}</Typography>
        <Typography variant="body1">Reviewed: {questionsReviewed}</Typography>
        <Typography variant="body1">Correct: {correctAnswers}</Typography>
        <Typography variant="body1">Percentage Correct: {percentageCorrect}%</Typography>
        <Typography variant="body1">
          Percentage Reviewed: 
          {((questionsReviewed / quizData?.length) * 100).toFixed(2)}%
        </Typography>
      </Box>

      {isRevisitingWrongAnswers && (
        <Box mt={4} display="flex" flexDirection="column" width="100%">
          <Typography variant="h6">Review Cycle: {reviewCycleCount + 1} / 3</Typography>
          <Typography variant="body1">Questions in this Cycle: {wrongAnswersReviewList.length}</Typography>
          <Typography variant="body1">Current Question: {currentReviewIndex + 1} / {wrongAnswersReviewList.length}</Typography>
          <Typography variant="body1">Correctly Answered in this Cycle: {Object.values(correctlyAnsweredInReview).filter(Boolean).length}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuizComponent;