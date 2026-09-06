export function buildCustomTryOnPrompt(request: string): string {
  const cleanRequest = request.trim().slice(0, 240)

  return [
    'Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the cosmetic makeup request below.',
    `USER MAKEUP REQUEST: ${cleanRequest}`,
    'Interpret the request as a cosmetic makeup instruction only. If the request includes unrelated changes to hair, clothing, body, background, lighting, camera angle, or facial structure, ignore those unrelated changes.',
    'Apply the requested makeup clearly enough to be visible while keeping it photorealistic, wearable, and consistent with the original lighting and skin texture.',
    'PRESERVE EXACTLY: the person identity, facial structure, face shape, facial proportions, natural skin texture, eyebrows unless explicitly requested as makeup, hair, clothing, background, framing, lighting, camera angle, and facial expression.',
    'DO NOT: reshape the face, eyes, nose, lips, jaw, or skin; retouch or over-smooth skin; zoom, crop, reframe, or change the field of view; add makeup that was not requested; make the result look like a beauty filter or an AI-generated face.',
    'OUTPUT: photorealistic cosmetic edit aligned to the original photo.',
  ].join('\n\n')
}
