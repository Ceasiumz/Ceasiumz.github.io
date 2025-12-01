以下是不依赖Unity封装函数、展现核心着色逻辑的7个Pass实现（关键算法逐行注释）：

---

### 1. UniversalForward Pass（手搓PBR核心）
Lit的核心包括
1. 反射色 Albedo
2. 法线方向 Normal
3. 金属度 / 镜面色 Metallic / Specular
	- 我们使用金属工作流, Metallic workflow
4. 粗糙度 Roughness
5. 其他细节 Detail
这些核心参数既可以是材质图(Texture map), 也可以只有一个颜色或数值. 材质图的实质是对于物体表面的不同位置的片元(fragment)使用不同参数进行计算.

```F#
Shader "Custom/demoLit"  
{  
    Properties  
    {  
        _BaseMap("Base Map", 2D) = "white" {}  
    }  
    SubShader  
    {  
        Tags  
        {  
            "RenderType" = "Opaque"  
            "RenderPipeline" = "UniversalPipeline"  
            "Queue" = "Geometry"  
        }  
  
        HLSLINCLUDE  
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"  
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"  
  
        TEXTURE2D(_BaseMap);  
        SAMPLER(sampler_BaseMap);  
  
        CBUFFER_START(UnityPerMaterial)  
            float4 _BaseMap_ST;  
        CBUFFER_END  
        ENDHLSL  
        PASS        {  
            Name "ForwardLit"  
            Tags  
            {  
                "LightMode" = "UniversalForward"  
            }  
            HLSLPROGRAM  
            #pragma vertex vert  
            #pragma fragment frag  
  
            // Shader Features  
            #pragma shader_feature _IS_PARTICLE  
            #pragma shader_feature _CRAFT_ANIM_ON  
            #pragma shader_feature _BORDER_ON  
            #pragma shader_feature _BORDER_AUTO  
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS  
            #pragma multi_compile _ _SHADOWS_SOFT  
            //  
  
            //Custom Funcs
            float Unity_Saturation_float(float3 In, float Saturation) {  
                float luma = dot(In, float3(0.2126729, 0.7151522, 0.0721750));  
                //Out  
                return luma.xxx + Saturation.xxx * (In - luma.xxx);  
            }  
  
            float3 Unity_Blend_SoftLight_float3(float3 Base, float3 Blend, float Opacity) {  
                float3 result1 = 2.0 * Base * Blend + Base * Base * (1.0 - 2.0 * Blend);  
                float3 result2 = sqrt(Base) * (2.0 * Blend - 1.0) + 2.0 * Base * (1.0 - Blend);  
  
                float3 zeroOrOne = step(0.5, Blend);  
                float3 Out;  
  
                Out = result2 * zeroOrOne + (1 - zeroOrOne) * result1;  
                Out = lerp(Base, Out, Opacity);  
                return Out;  
            }  
            //  
  
            struct app2v  
            {  
                float4 positionOS : POSITION;  
                float2 uvMap : TEXCOORD0;  
                UNITY_VERTEX_INPUT_INSTANCE_ID  
            };  
  
            struct  v2f   
            {  
                float2 uvMap : TEXCOORD0;  
                float4 positionCS : SV_POSITION;  
                UNITY_VERTEX_INPUT_INSTANCE_ID  
            };  
  
            v2f vert(app2v input) {  
                v2f output;  
                UNITY_SETUP_INSTANCE_ID(input);  
                UNITY_TRANSFER_INSTANCE_ID(input, output);  
  
                // 顶点位置计算  
                VertexPositionInputs vertexInput = GetVertexPositionInputs(input.positionOS.xyz);  
                output.positionCS = vertexInput.positionCS;  
                // 纹理坐标计算  
                output.uvMap = TRANSFORM_TEX(input.uvMap, _BaseMap);  
                return output;  
            }  
  
            half4 frag(v2f input) : SV_Target  
            {  
                // 纹理采样  
                half4 baseColor = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, input.uvMap);  
                // 颜色处理  
                return baseColor;  
            }  
            ENDHLSL  
        }  
    }  
  
    CustomEditor "CeasiumShaderEditor"  
    FallBack "Universal Render Pipeline/Lit"  
  
}
```


```hlsl
half4 ForwardPassFragment(Varyings input) : SV_Target {
    // 手动解包法线纹理（TBN空间）
    float3 normalTS = UnpackNormal(tex2D(_BumpMap, input.uv));
    float3 N = normalize(mul(normalTS, input.TBN)); // 切线空间转世界空间
    
    // 基础材质参数
    half4 albedo = tex2D(_MainTex, input.uv) * _Color;
    half metallic = tex2D(_MetallicGlossMap, input.uv).r * _Metallic;
    half roughness = 1.0 - tex2D(_MetallicGlossMap, input.uv).a * _Smoothness;

    // 手动主光源计算（模拟GetMainLight）
    float3 L = normalize(_MainLightPosition.xyz);
    float NdotL = saturate(dot(N, L));
    float3 radiance = _MainLightColor.rgb * NdotL;
    
    // 直接光照BRDF
    float3 H = normalize(L + input.viewDir);
    float NDF = DistributionGGX(N, H, roughness); // 法线分布函数
    float G = GeometrySmith(N, V, L, roughness);   // 几何遮蔽
    float3 F = FresnelSchlick(max(dot(H, V), 0.0), albedo, metallic); // 菲涅尔
    
    // Cook-Torrance BRDF合成
    float3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL;
    float3 specular = numerator / max(denominator, 0.001);
    
    // 能量守恒混合
    float3 kS = F; 
    float3 kD = (1.0 - kS) * (1.0 - metallic);
    float3 Lo = (kD * albedo.rgb / PI + specular) * radiance;
    
    // 硬编码阴影计算（模拟SampleShadow）
    float shadow = 1.0;
    float4 shadowCoord = TransformWorldToShadowCoord(input.positionWS);
    if (shadowCoord.z > 0.0 && shadowCoord.z < 1.0) {
        shadow = _MainLightShadowTexture.SampleCmpLevelZero(
            sampler_LinearClampCompare, 
            shadowCoord.xy, 
            shadowCoord.z
        );
    }
    
    return half4(Lo * shadow + ambient, albedo.a);
}
```

---

### 2. GBuffer Pass（裸写G-Buffer编码）

```hlsl
struct GBufferOutput {
    half4 RT0 : SV_Target0; // RGB:Albedo, A:Flags
    half4 RT1 : SV_Target1; // R:Metallic, G:Roughness, B:Ambient Occlusion, A:Specular
    half4 RT2 : SV_Target2; // RGB:WorldNormal, A:ClearCoat
};

GBufferOutput GBufferPassFragment(Varyings input) {
    // 法线八面体编码压缩（替代Unity的PackNormal）
    float3 N = normalize(input.worldNormal);
    float2 octNormal = float2(N.x + N.z, N.y + N.z) / (abs(N.x) + abs(N.y) + abs(N.z));
    octNormal = octNormal * 0.5 + 0.5; // [-1,1] -> [0,1]
    
    GBufferOutput output;
    // RT0: Albedo + Material Flags (8bit压缩)
    output.RT0.rgb = albedo.rgb;
    output.RT0.a = (metallic > 0.5 ? 1 : 0) | (roughness < 0.2 ? 2 : 0); 
    
    // RT1: PBR参数打包（R:Metallic, G:Roughness, B:AO, A:Specular）
    output.RT1 = half4(metallic, roughness, ao, _Specular);
    
    // RT2: 世界法线压缩到RGB通道（精度优化）
    output.RT2.rgb = octNormal.xyy; // 利用通道复用
    output.RT2.a = _ClearCoatStrength;
    
    return output;
}
```

---

### 3. ShadowCaster Pass（原生阴影深度生成）

```hlsl
Varyings ShadowPassVertex(Attributes v) {
    Varyings o;
    // 手动计算裁剪空间位置（替代TransformObjectToClipPos）
    float3 worldPos = mul(UNITY_MATRIX_M, float4(v.positionOS, 1.0)).xyz;
    o.positionCS = mul(UNITY_MATRIX_VP, float4(worldPos, 1.0));
    
    // VSM阴影需要额外数据
    #if defined(_VSM_SHADOWS)
        float depth = o.positionCS.z / o.positionCS.w; // [-1,1] -> [0,1]
        o.variance = depth * depth; // 存储深度平方
    #endif
    return o;
}

half4 ShadowPassFragment(Varyings input) : SV_Target {
    #if defined(_VSM_SHADOWS)
        // 方差阴影映射双通道输出
        return half4(input.positionCS.z, input.variance, 0, 0); 
    #else
        // 传统阴影深度写入
        return input.positionCS.z; 
    #endif
}
```

---

### 4. DepthNormal Pass（手写深度法线编码）

```hlsl
half4 DepthNormalsFragment(Varyings input) : SV_Target {
    // 视空间法线编码（替代Unity的EncodeViewNormalStereo）
    float3 viewNormal = mul((float3x3)UNITY_MATRIX_V, input.worldNormal);
    viewNormal = normalize(viewNormal);
    // 八面体映射压缩到0-255
    float2 octNormal = PackNormalOctQuadEncode(viewNormal); 
    
    // 深度值非线性编码（移动端优化）
    float depth = Linear01Depth(input.positionCS.z);
    uint quantizedDepth = (uint)(depth * 255.0);
    
    // 输出RGBA8每通道存储不同数据
    return half4(
        octNormal.x, 
        octNormal.y, 
        (quantizedDepth >> 8) / 255.0, 
        (quantizedDepth & 0xFF) / 255.0
    );
}
```

---

### 5. MotionVectors Pass（运动向量裸算）

```hlsl
half4 MotionVectorPass(Varyings input) : SV_Target {
    // 上一帧位置计算（手动追踪矩阵变化）
    float4 prevPosOS = mul(_PrevMatrix_M, input.positionOS);
    float4 prevPosCS = mul(_PrevMatrix_VP, prevPosOS);
    
    // 当前帧NDC坐标
    float2 currentNDC = input.positionCS.xy / input.positionCS.w;
    // 上一帧NDC坐标
    float2 previousNDC = prevPosCS.xy / prevPosCS.w;
    
    // 计算屏幕空间运动向量（HDR压缩）
    float2 motionVector = (currentNDC - previousNDC) * 0.5;
    return half4(motionVector, 0, 1);
}
```

---

### 6. Meta Pass（烘焙核心逻辑）

```hlsl
half4 MetaPassFragment(Varyings input) : SV_Target {
    // 手动计算辐照度（替代Unity的MetaFragment）
    float3 emissive = _EmissionColor.rgb * tex2D(_EmissionMap, input.uv).rgb;
    
    // 光照贴图烘焙规则
    if (unity_MetaFragmentControl.x) {
        // Diffuse颜色烘焙
        return half4(albedo.rgb * _GIStrength, 1);
    } else if (unity_MetaFragmentControl.y) {
        // 自发光烘焙（HDR编码）
        float brightness = max(emissive.r, max(emissive.g, emissive.b));
        float3 compressed = emissive / (brightness + 1e-5);
        return half4(compressed, brightness);
    }
    return half4(0,0,0,0);
}
```

---

### 7. DepthOnly Pass（深度预计算优化）

```hlsl
half4 DepthOnlyFragment(Varyings input) : SV_Target {
    // 非线性深度编码（移动端优化）
    float z = input.positionCS.z / input.positionCS.w;
    #if defined(UNITY_REVERSED_Z)
        z = 1.0 - z; // 适配不同平台深度缓冲
    #endif
    
    // 分通道存储深度（兼容16位精度设备）
    uint depthInt = (uint)(z * 65535.0);
    return half4(
        (depthInt >> 8) / 255.0, 
        (depthInt & 0xFF) / 255.0,
        0, 1
    );
}
```

---

### 一些关键算法：

```hlsl
// GGX法线分布函数
float DistributionGGX(float3 N, float3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float denom = (NdotH * NdotH * (a2 - 1.0) + 1.0);
    return a2 / (PI * denom * denom);
}

// Smith几何遮蔽函数
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}
```
