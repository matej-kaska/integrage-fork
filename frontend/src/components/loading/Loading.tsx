type LoadingProps = {
  upper?: boolean;
  modal?: boolean;
}

const Loading = ({upper, modal}: LoadingProps) => {
  return (
    <section className={`loading ${upper ? "upper" : ""} ${modal ? "modal" : ""}`}>
      <span className="loader"/>
    </section>
  );
};

export default Loading;