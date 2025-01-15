const WrongAnswersDisplay = ({ wrongAnswers }) => {
    return (
      <div>
        <h2>Wrong Answers</h2>
        {wrongAnswers.map((answer, index) => (
          <div key={index}>
            <h3>Question Details:</h3>
            {/* Render question details here */}
            <h3>Selected Answers:</h3>
            {/* Render selected answers here */}
          </div>
        ))}
      </div>
    );
  };
  