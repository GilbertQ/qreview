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

  const handleConfirm = () => {
    setShowExplanation(true);

    if (isRevisitingWrongAnswers) {
      setRevisitedQuestionsReviewed(revisitedQuestionsReviewed + 1);
    } else {
      setQuestionsReviewed(questionsReviewed + 1);
    }

    const correctAnswerLine = currentQuestion.find(line => line.startsWith("Answer"));
    const correctAnswersList = correctAnswerLine
      .replace("Answer:", "")
      .replace(".", "")
      .split(",")
      .map(ans => ans.trim());

    const selectedAnswerChars = selectedAnswers.map(answer => answer.charAt(0));

    const allCorrect = correctAnswersList.length === selectedAnswerChars.length &&
      correctAnswersList.every(ans => selectedAnswerChars.includes(ans));

    if (allCorrect) {
      if (isRevisitingWrongAnswers) {
        setRevisitedCorrectAnswers(revisitedCorrectAnswers + 1);
      } else {
        setCorrectAnswers(correctAnswers + 1);
      }
    } else {
      setWronglyAnsweredQuestions(prev => [...prev, currentQuestion]);
    }

    const currentPercentageCorrect = isRevisitingWrongAnswers
      ? ((revisitedCorrectAnswers + (allCorrect ? 1 : 0)) / (revisitedQuestionsReviewed + 1)) * 100
      : ((correctAnswers + (allCorrect ? 1 : 0)) / (questionsReviewed + 1)) * 100;

    if (!isRevisitingWrongAnswers && currentPercentageCorrect < 80 && wronglyAnsweredQuestions.length > 5) {
      setIsRevisitingWrongAnswers(true);
      setUsedQuestions([]);
      setRevisitedQuestionsReviewed(0);
      setRevisitedCorrectAnswers(0);
    }
  };

  const handleContinue = () => {
    selectRandomQuestion(quizData);
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
          <Typography variant="h6">Revisit Cycle: {revisitCycleCount + 1} / 2</Typography>
          <Typography variant="body1">Questions in this Cycle: {revisitedQuestionsReviewed}</Typography>
          <Typography variant="body1">Correct in this Cycle: {revisitedCorrectAnswers}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuizComponent;







