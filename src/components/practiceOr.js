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
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isReviewingWrongAnswers, setIsReviewingWrongAnswers] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setQuizData(data);
      setUsedQuestions([]); // Reset used questions when new file is uploaded
      selectRandomQuestion(data);
    };
    reader.readAsText(file);
  };

  const selectRandomQuestion = (data) => {
    const unusedQuestions = data.filter((_, index) => !usedQuestions.includes(index));
    if (unusedQuestions.length === 0) {
      // All questions have been used, reset the usedQuestions
      setUsedQuestions([]);
      selectRandomQuestion(data); // Recursive call to select a question after reset
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
  
    if (!allCorrect) {
      setWrongAnswers(prevWrongAnswers => [
        ...prevWrongAnswers,
        { questionDetails: currentQuestion, selectedAnswers },
      ]);
    }
  
    if (allCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const handleContinue = () => {
    if (isReviewingWrongAnswers) {
      if (reviewIndex < wrongAnswers.length - 1) {
        setReviewIndex(reviewIndex + 1);
        setCurrentQuestion(wrongAnswers[reviewIndex + 1].questionDetails);
        setSelectedAnswers([]);
        setShowExplanation(false);
      } else {
        setIsReviewingWrongAnswers(false);
        setReviewIndex(0);
        setWrongAnswers([]);
        selectRandomQuestion(quizData); // Resume the regular quiz flow
      }
    } else {
      selectRandomQuestion(quizData);
    }
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
  const percentageCorrect = questionsReviewed > 0 ? ((correctAnswers / usedQuestions.length) * 100).toFixed(2) : 0;

  const shouldShowRepaso = percentageCorrect < 80 && wrongAnswers.length > 5;

  return (
    <Box>
      {!shouldShowRepaso && !isReviewingWrongAnswers && (
        <Box id="preguntas">
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
            <Button variant="contained" color="success" onClick={handleConfirm}>
              Confirm
            </Button>
          ) : (
            <>
              <Button variant="contained" onClick={handleContinue}>
                Continue
              </Button>
              <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>{explanationText}</Typography>
            </>
          )}
          <Box mt={4} display="flex" justifyContent="space-between" width="100%">
            <Typography variant="body1">Questions: {quizData ? quizData.length : 0}</Typography>
            <Typography variant="body1">Reviewed: {usedQuestions.length}</Typography>
            <Typography variant="body1">Correct: {correctAnswers}</Typography>
            <Typography variant="body1">Percentage Correct: {percentageCorrect}%</Typography>
            <Typography variant="body1">Percentage Reviewed:{((usedQuestions.length / quizData?.length) * 100).toFixed(2)}%</Typography>
          </Box>
        </Box>
      )}

      {shouldShowRepaso && !isReviewingWrongAnswers && (
        <Box id="repaso">
          <Typography variant="h1">Those were more than 5 wrong answers and a score under 80</Typography>
          <Button variant="contained" color="primary" onClick={() => setIsReviewingWrongAnswers(true)}>
            Review Wrong Answers
          </Button>
        </Box>
      )}

      {isReviewingWrongAnswers && (
        <Box id="preguntas">
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
            <Button variant="contained" color="success" onClick={handleConfirm}>
              Confirm
            </Button>
          ) : (
            <>
              <Button variant="contained" onClick={handleContinue}>
                Continue
              </Button>
              <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>{explanationText}</Typography>
            </>
          )}
          <Box mt={4} display="flex" justifyContent="space-between" width="100%">
            <Typography variant="body1">Wrong Answer {reviewIndex + 1} of {wrongAnswers.length}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QuizComponent;











