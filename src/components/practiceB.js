import React, { useState } from 'react';
import { Button, Typography, Checkbox, FormControlLabel, FormControl, Box } from '@mui/material';

const QuizComponent = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsReviewed, setQuestionsReviewed] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setQuizData(data);
      selectRandomQuestion(data);
    };
    reader.readAsText(file);
  };

  const selectRandomQuestion = (data) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setCurrentQuestion(data[randomIndex]);
    setSelectedAnswers([]);
    setShowExplanation(false);
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
    setQuestionsReviewed(questionsReviewed + 1);

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
      setCorrectAnswers(correctAnswers + 1);
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
  const explanationText = currentQuestion.slice(explanationIndex).join(' ');

  const percentageCorrect = questionsReviewed > 0 ? ((correctAnswers / questionsReviewed) * 100).toFixed(2) : 0;

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
        <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
      ) : (
        <>
          <Typography variant="h6">{explanationText}</Typography>
          <Button variant="contained" onClick={handleContinue}>Continue</Button>
        </>
      )}

      <Box mt={4}>
        <Typography variant="body1">Number of Questions Reviewed: {questionsReviewed}</Typography>
        <Typography variant="body1">Number of Questions Correctly Answered: {correctAnswers}</Typography>
        <Typography variant="body1">Percentage of Correctly Answered Questions: {percentageCorrect}%</Typography>
      </Box>
    </Box>
  );
};

export default QuizComponent;