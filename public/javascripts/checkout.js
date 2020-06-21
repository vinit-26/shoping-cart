Stripe.setPublishableKey(
  "pk_test_51GvKVrDuWKWteuMdv9AXqmP5cE6JdYX1BE91sxgTJszjzE93EUsscRFWoa8ECcrRM5TAOfi8SG9uV6ObYmxjdoxS00GlelSr18"
);

var $form = $("#checkout-form");

$form.submit(function (event) {
  $form.find("button").prop("disabled", true);
  $("#charge-error").addClass("hidden");
  Stripe.card.createToken(
    {
      number: $("#card-number").val(),
      cvc: $("#card-cvv").val(),
      exp_month: $("#card-expiration-month").val(),
      exp_year: $("#card-expiration-year").val(),
      name: $("#card-name").val(),
    },
    stripeResponseHandler
  );
  return false;
});

function stripeResponseHandler(status, response) {
  if (response.error) {
    console.log(response.error);
    $("#charge-error").text(response.error.message);
    $("#charge-error").removeClass("hidden");
    $form.find("button").prop("disabled", false);
  } else {
    var token = response.id;
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    $form.get(0).submit();
  }
}
